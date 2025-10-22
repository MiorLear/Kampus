import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  MoreVertical
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Course {
  id: string;
  title: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentStatus: 'pending' | 'approved' | 'rejected';
  progress: number;
  lastActive: string;
  enrollmentDate: string;
  completedModules: number;
  totalModules: number;
  averageGrade?: number;
}

const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    enrollmentStatus: 'approved',
    progress: 65,
    lastActive: '2024-01-10',
    enrollmentDate: '2024-01-01',
    completedModules: 8,
    totalModules: 12,
    averageGrade: 85
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    enrollmentStatus: 'approved',
    progress: 42,
    lastActive: '2024-01-09',
    enrollmentDate: '2024-01-02',
    completedModules: 5,
    totalModules: 12,
    averageGrade: 92
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    enrollmentStatus: 'pending',
    progress: 0,
    lastActive: '2024-01-08',
    enrollmentDate: '2024-01-08',
    completedModules: 0,
    totalModules: 12
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    enrollmentStatus: 'approved',
    progress: 100,
    lastActive: '2024-01-07',
    enrollmentDate: '2023-12-15',
    completedModules: 12,
    totalModules: 12,
    averageGrade: 95
  }
];

interface RosterManagerProps {
  course: Course;
  onBack: () => void;
}

export function RosterManager({ course, onBack }: RosterManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [students, setStudents] = useState(mockStudents);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || student.enrollmentStatus === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const approveStudent = (studentId: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, enrollmentStatus: 'approved' as const }
        : student
    ));
  };

  const rejectStudent = (studentId: string) => {
    setStudents(prev => prev.map(student => 
      student.id === studentId 
        ? { ...student, enrollmentStatus: 'rejected' as const }
        : student
    ));
  };

  const sendMessage = (studentId: string) => {
    // Mock function for sending messages
    console.log('Send message to student:', studentId);
  };

  const approvedStudents = students.filter(s => s.enrollmentStatus === 'approved');
  const pendingStudents = students.filter(s => s.enrollmentStatus === 'pending');
  const averageProgress = approvedStudents.length > 0 
    ? approvedStudents.reduce((sum, s) => sum + s.progress, 0) / approvedStudents.length 
    : 0;

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Courses
        </Button>
        <div>
          <h1>Student Roster</h1>
          <p className="text-muted-foreground">{course.title}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{approvedStudents.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{pendingStudents.length}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
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
                  {approvedStudents.filter(s => s.progress === 100).length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as any)} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Students</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingStudents.length})</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
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
                        <Badge variant={
                          student.enrollmentStatus === 'approved' ? 'default' :
                          student.enrollmentStatus === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {student.enrollmentStatus}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                        <span>Last active: {new Date(student.lastActive).toLocaleDateString()}</span>
                        {student.averageGrade && (
                          <span>Average grade: {student.averageGrade}%</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {student.enrollmentStatus === 'approved' && (
                      <div className="text-right min-w-32">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="w-24" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {student.completedModules}/{student.totalModules} modules
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {student.enrollmentStatus === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rejectStudent(student.id)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => approveStudent(student.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => sendMessage(student.id)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Message
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            View Grades
                          </DropdownMenuItem>
                          {student.enrollmentStatus === 'approved' && (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => rejectStudent(student.id)}
                            >
                              Remove from Course
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredStudents.filter(s => s.enrollmentStatus === 'approved').map(student => (
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
                      <h3 className="font-medium">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                        <span>Average grade: {student.averageGrade}%</span>
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
                      <div className="text-xs text-muted-foreground mt-1">
                        {student.completedModules}/{student.totalModules} modules
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pending Enrollments</h3>
                <p className="text-muted-foreground">
                  All enrollment requests have been processed.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingStudents.map(student => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-6 w-6 text-orange-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested: {new Date(student.enrollmentDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => rejectStudent(student.id)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button onClick={() => approveStudent(student.id)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
