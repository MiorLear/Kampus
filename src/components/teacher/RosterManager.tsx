import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft, 
  Search, 
  CheckCircle,
  Mail,
  MoreVertical,
  Loader2,
  UserX
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentStatus: 'approved'; // Simplified as backend doesn't support pending yet
  progress: number;
  lastActive?: string;
  enrollmentDate: string;
  enrollmentId: string;
}

// Minimal debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface RosterManagerProps {
  course: Course;
  onBack: () => void;
}

interface ApiEnrollment {
  id: string;
  student_id: string;
  progress?: number;
  enrolled_at?: string;
  last_accessed?: string;
  [key: string]: any;
}

interface ApiUser {
  id: string;
  name?: string;
  email?: string;
  [key: string]: any;
}

export function RosterManager({ course, onBack }: RosterManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRoster();
  }, [course.id]);

  useEffect(() => {
    if (students.length > 0) {
      const filtered = students.filter(student => {
        return student.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
               student.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      });
      setFilteredStudents(filtered);
    } else {
      setFilteredStudents([]);
    }
  }, [debouncedSearchTerm, students]);

  const loadRoster = async () => {
    try {
      setLoading(true);
      // Fetch enrollments and users in parallel
      const [enrollments, users] = await Promise.all([
        ApiService.getEnrollmentsByCourse(course.id),
        ApiService.getAllUsers()
      ]);

      // Map enrollments to students
      const rosterData: Student[] = enrollments
        .map((enrollment: ApiEnrollment) => {
          const user = users.find((u: ApiUser) => u.id === enrollment.student_id);
          if (!user) return null;
          
          return {
            id: user.id,
            name: user.name || 'Unknown',
            email: user.email || '',
            enrollmentStatus: 'approved' as const, // Explicitly cast to literal
            progress: enrollment.progress || 0,
            enrollmentDate: enrollment.enrolled_at || new Date().toISOString(),
            enrollmentId: enrollment.id,
            lastActive: enrollment.last_accessed // If available
          } as Student;
        })
        .filter((s): s is Student => s !== null);

      setStudents(rosterData);
      setFilteredStudents(rosterData);
    } catch (error) {
      console.error('Error loading roster:', error);
      toast.error('Failed to load student roster');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (student: Student) => {
    if (confirm(`Are you sure you want to remove ${student.name} from the course?`)) {
      try {
        await ApiService.unenrollStudent(student.enrollmentId);
        toast.success('Student removed from course');
        loadRoster(); // Reload list
      } catch (error) {
        console.error('Error removing student:', error);
        toast.error('Failed to remove student');
      }
    }
  };

  const sendMessage = (studentId: string) => {
    // Placeholder for actual messaging integration
    toast.info('Messaging feature coming soon');
  };

  const averageProgress = students.length > 0 
    ? students.reduce((sum: number, s) => sum + s.progress, 0) / students.length 
    : 0;

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Student Roster</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading roster...</span>
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{students.length}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Progress</p>
                    <p className="text-2xl font-bold">{Math.round(averageProgress)}%</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-bold">%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                    <p className="text-2xl font-bold">
                      {students.filter(s => s.progress === 100).length}
                    </p>
                    <p className="text-xs text-muted-foreground">Students at 100%</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
               <div className="text-center py-12 border rounded-lg bg-slate-50">
                 <p className="text-muted-foreground">No students found matching your search.</p>
               </div>
            ) : (
              <div className="grid gap-4">
                {filteredStudents.map(student => (
                  <Card key={student.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="font-semibold text-primary">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium">{student.name}</h3>
                              <Badge variant="default">
                                {student.enrollmentStatus}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                              {student.lastActive && (
                                <span>Last active: {new Date(student.lastActive).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right min-w-32">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>Progress</span>
                              <span>{student.progress}%</span>
                            </div>
                            <Progress value={student.progress} className="w-24" />
                          </div>

                          <div className="flex items-center gap-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => sendMessage(student.id)}>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleRemoveStudent(student)}
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Remove from Course
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
