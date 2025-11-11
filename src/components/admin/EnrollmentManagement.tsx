import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search, TrendingUp, UserX } from 'lucide-react';
import { Course, User, Enrollment } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { formatDate } from '../../utils/firebase-helpers';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';

interface EnrollmentManagementProps {
  courses: Course[];
  users: User[];
}

export function EnrollmentManagement({ courses, users }: EnrollmentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const allEnrollments: Enrollment[] = [];
      
      for (const course of courses) {
        const courseEnrollments = await ApiService.getEnrollmentsByCourse(course.id);
        allEnrollments.push(...courseEnrollments);
      }
      
      setEnrollments(allEnrollments);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = users.find(u => u.id === enrollment.student_id);
    const course = courses.find(c => c.id === enrollment.course_id);
    
    const matchesSearch = (student?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (student?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || enrollment.course_id === courseFilter;
    
    return matchesSearch && matchesCourse;
  });

  const getStudentName = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const handleUnenroll = async (enrollmentId: string) => {
    try {
      await ApiService.unenrollStudent(enrollmentId);
      toast.success('Student unenrolled successfully');
      loadEnrollments();
    } catch (error) {
      toast.error('Failed to unenroll student');
      console.error(error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Enrollment Management</CardTitle>
            <CardDescription>
              Monitor and manage student enrollments
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enrollments..."
                className="pl-10 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading enrollments...
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No enrollments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {getStudentName(enrollment.student_id)}
                        </TableCell>
                        <TableCell>{getCourseName(enrollment.course_id)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={enrollment.progress} className="w-24" />
                            <span className={`text-sm ${getProgressColor(enrollment.progress)}`}>
                              {enrollment.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(enrollment.enrolled_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnenroll(enrollment.id)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredEnrollments.length} of {enrollments.length} enrollments
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">75%+ Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">50-74%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <span className="text-muted-foreground">25-49%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <span className="text-muted-foreground">{'<'}25%</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
