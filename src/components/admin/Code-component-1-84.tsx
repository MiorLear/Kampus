import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { 
  Search, 
  Filter, 
  MoreVertical,
  CheckCircle,
  XCircle,
  Users,
  BookOpen,
  Calendar,
  Download,
  Upload
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  instructor: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped';
  enrollmentDate: string;
  approvalDate?: string;
  progress: number;
  grade?: number;
  lastActivity: string;
}

const mockEnrollments: Enrollment[] = [
  {
    id: '1',
    studentName: 'John Doe',
    studentEmail: 'john@example.com',
    courseName: 'Introduction to Web Development',
    instructor: 'Dr. Sarah Martinez',
    status: 'approved',
    enrollmentDate: '2024-01-01',
    approvalDate: '2024-01-02',
    progress: 65,
    lastActivity: '2024-01-10'
  },
  {
    id: '2',
    studentName: 'Jane Smith',
    studentEmail: 'jane@example.com',
    courseName: 'Advanced React Patterns',
    instructor: 'Prof. Miguel Rodriguez',
    status: 'completed',
    enrollmentDate: '2023-12-15',
    approvalDate: '2023-12-16',
    progress: 100,
    grade: 95,
    lastActivity: '2024-01-08'
  },
  {
    id: '3',
    studentName: 'Mike Johnson',
    studentEmail: 'mike@example.com',
    courseName: 'Database Design Fundamentals',
    instructor: 'Prof. Carlos Lopez',
    status: 'pending',
    enrollmentDate: '2024-01-08',
    progress: 0,
    lastActivity: '2024-01-08'
  },
  {
    id: '4',
    studentName: 'Sarah Wilson',
    studentEmail: 'sarah@example.com',
    courseName: 'Python for Data Science',
    instructor: 'Dr. Maria Fernandez',
    status: 'completed',
    enrollmentDate: '2023-09-01',
    approvalDate: '2023-09-02',
    progress: 100,
    grade: 98,
    lastActivity: '2023-12-15'
  },
  {
    id: '5',
    studentName: 'Alex Chen',
    studentEmail: 'alex@example.com',
    courseName: 'Introduction to Web Development',
    instructor: 'Dr. Sarah Martinez',
    status: 'pending',
    enrollmentDate: '2024-01-09',
    progress: 0,
    lastActivity: '2024-01-09'
  },
  {
    id: '6',
    studentName: 'Emma Davis',
    studentEmail: 'emma@example.com',
    courseName: 'Advanced React Patterns',
    instructor: 'Prof. Miguel Rodriguez',
    status: 'approved',
    enrollmentDate: '2024-01-05',
    approvalDate: '2024-01-06',
    progress: 42,
    lastActivity: '2024-01-09'
  }
];

export function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState(mockEnrollments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.courseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || enrollment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || enrollment.courseName === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  const updateEnrollmentStatus = (enrollmentId: string, newStatus: 'pending' | 'approved' | 'rejected' | 'completed' | 'dropped') => {
    setEnrollments(prev => prev.map(enrollment => 
      enrollment.id === enrollmentId 
        ? { 
            ...enrollment, 
            status: newStatus,
            approvalDate: newStatus === 'approved' ? new Date().toISOString().split('T')[0] : enrollment.approvalDate
          } 
        : enrollment
    ));
  };

  const bulkApprove = (enrollmentIds: string[]) => {
    setEnrollments(prev => prev.map(enrollment => 
      enrollmentIds.includes(enrollment.id) 
        ? { 
            ...enrollment, 
            status: 'approved' as const,
            approvalDate: new Date().toISOString().split('T')[0]
          } 
        : enrollment
    ));
  };

  const bulkReject = (enrollmentIds: string[]) => {
    setEnrollments(prev => prev.map(enrollment => 
      enrollmentIds.includes(enrollment.id) 
        ? { ...enrollment, status: 'rejected' as const } 
        : enrollment
    ));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      case 'dropped':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-orange-600';
      case 'rejected':
        return 'text-red-600';
      case 'dropped':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const totalEnrollments = enrollments.length;
  const pendingEnrollments = enrollments.filter(e => e.status === 'pending').length;
  const approvedEnrollments = enrollments.filter(e => e.status === 'approved').length;
  const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;

  const courses = [...new Set(enrollments.map(e => e.courseName))];
  const pendingEnrollmentIds = enrollments.filter(e => e.status === 'pending').map(e => e.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Enrollment Management</h2>
          <p className="text-muted-foreground">Manage student enrollments and approvals</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Import
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalEnrollments}</p>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{pendingEnrollments}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{approvedEnrollments}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedEnrollments}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, email, or course..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
              </SelectContent>
            </Select>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course} value={course}>{course}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {pendingEnrollments > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => bulkApprove(pendingEnrollmentIds)}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve All Pending ({pendingEnrollments})
              </Button>
              <Button 
                variant="outline"
                onClick={() => bulkReject(pendingEnrollmentIds)}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject All Pending
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enrollments List */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollments ({filteredEnrollments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEnrollments.map(enrollment => (
              <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary text-sm">
                      {enrollment.studentName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{enrollment.studentName}</h3>
                      <Badge variant={getStatusBadgeVariant(enrollment.status)}>
                        {enrollment.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">{enrollment.studentEmail}</p>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{enrollment.courseName}</span>
                      <span className="text-sm text-muted-foreground">by {enrollment.instructor}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Enrolled: {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                      </span>
                      {enrollment.approvalDate && (
                        <span>Approved: {new Date(enrollment.approvalDate).toLocaleDateString()}</span>
                      )}
                      <span>Last activity: {new Date(enrollment.lastActivity).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {enrollment.status === 'approved' || enrollment.status === 'completed' ? (
                    <div className="text-right min-w-32">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <Progress value={enrollment.progress} className="w-24" />
                      {enrollment.grade && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Grade: {enrollment.grade}%
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32"></div>
                  )}

                  <div className="flex items-center gap-2">
                    {enrollment.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateEnrollmentStatus(enrollment.id, 'rejected')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => updateEnrollmentStatus(enrollment.id, 'approved')}
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
                        <DropdownMenuItem>
                          View Student Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          View Course Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          View Progress Report
                        </DropdownMenuItem>
                        
                        {enrollment.status === 'approved' && (
                          <DropdownMenuItem onClick={() => updateEnrollmentStatus(enrollment.id, 'dropped')}>
                            Drop from Course
                          </DropdownMenuItem>
                        )}
                        
                        {enrollment.status === 'rejected' && (
                          <DropdownMenuItem onClick={() => updateEnrollmentStatus(enrollment.id, 'approved')}>
                            Approve Enrollment
                          </DropdownMenuItem>
                        )}

                        {enrollment.status === 'dropped' && (
                          <DropdownMenuItem onClick={() => updateEnrollmentStatus(enrollment.id, 'approved')}>
                            Re-enroll Student
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredEnrollments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No enrollments found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Statistics by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courses.map(course => {
              const courseEnrollments = enrollments.filter(e => e.courseName === course);
              const approved = courseEnrollments.filter(e => e.status === 'approved').length;
              const completed = courseEnrollments.filter(e => e.status === 'completed').length;
              const pending = courseEnrollments.filter(e => e.status === 'pending').length;
              const avgProgress = courseEnrollments.length > 0 
                ? courseEnrollments.reduce((sum, e) => sum + e.progress, 0) / courseEnrollments.length 
                : 0;

              return (
                <div key={course} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{course}</h3>
                    <span className="text-sm text-muted-foreground">{courseEnrollments.length} total</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-orange-600">{pending}</p>
                      <p className="text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{approved}</p>
                      <p className="text-muted-foreground">Active</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-green-600">{completed}</p>
                      <p className="text-muted-foreground">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">{Math.round(avgProgress)}%</p>
                      <p className="text-muted-foreground">Avg Progress</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}