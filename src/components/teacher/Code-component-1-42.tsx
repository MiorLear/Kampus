import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus,
  Edit,
  Eye,
  MoreVertical,
  Calendar,
  Award,
  Clock
} from 'lucide-react';
import { CourseEditor } from './CourseEditor';
import { RosterManager } from './RosterManager';
import { EvaluationBuilder } from './EvaluationBuilder';
import { TeacherAnalytics } from './TeacherAnalytics';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  enrolledStudents: number;
  totalModules: number;
  completionRate: number;
  createdAt: string;
  lastUpdated: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  enrollmentStatus: 'pending' | 'approved' | 'rejected';
  progress: number;
  lastActive: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the basics of HTML, CSS, and JavaScript',
    status: 'published',
    enrolledStudents: 24,
    totalModules: 12,
    completionRate: 78,
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-10'
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts and patterns',
    status: 'published',
    enrolledStudents: 18,
    totalModules: 16,
    completionRate: 65,
    createdAt: '2024-01-15',
    lastUpdated: '2024-01-20'
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    description: 'Build robust backend applications with Node.js',
    status: 'draft',
    enrolledStudents: 0,
    totalModules: 8,
    completionRate: 0,
    createdAt: '2024-02-01',
    lastUpdated: '2024-02-05'
  }
];

const mockPendingEnrollments: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    enrollmentStatus: 'pending',
    progress: 0,
    lastActive: '2024-01-10'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    enrollmentStatus: 'pending',
    progress: 0,
    lastActive: '2024-01-09'
  }
];

interface TeacherDashboardProps {
  user: User;
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  if (activeView === 'course-editor') {
    return (
      <CourseEditor
        course={selectedCourse}
        onBack={() => {
          setActiveView('courses');
          setSelectedCourse(null);
        }}
        onSave={(courseData) => {
          console.log('Course saved:', courseData);
          setActiveView('courses');
          setSelectedCourse(null);
        }}
      />
    );
  }

  if (activeView === 'roster-manager' && selectedCourse) {
    return (
      <RosterManager
        course={selectedCourse}
        onBack={() => {
          setActiveView('courses');
          setSelectedCourse(null);
        }}
      />
    );
  }

  if (activeView === 'evaluation-builder' && selectedCourse) {
    return (
      <EvaluationBuilder
        course={selectedCourse}
        onBack={() => {
          setActiveView('courses');
          setSelectedCourse(null);
        }}
      />
    );
  }

  const publishedCourses = mockCourses.filter(c => c.status === 'published');
  const totalStudents = mockCourses.reduce((sum, course) => sum + course.enrolledStudents, 0);
  const avgCompletionRate = mockCourses.reduce((sum, course) => sum + course.completionRate, 0) / mockCourses.length;

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground">Manage your courses and track student progress</p>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Published Courses</p>
                    <p className="text-2xl font-bold">{publishedCourses.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="text-2xl font-bold">{totalStudents}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Completion</p>
                    <p className="text-2xl font-bold">{Math.round(avgCompletionRate)}%</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                    <p className="text-2xl font-bold">{mockPendingEnrollments.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Courses</CardTitle>
                  <CardDescription>Overview of your published courses</CardDescription>
                </div>
                <Button onClick={() => {
                  setSelectedCourse(null);
                  setActiveView('course-editor');
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCourses.slice(0, 3).map(course => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{course.title}</h3>
                        <Badge variant={
                          course.status === 'published' ? 'default' : 
                          course.status === 'draft' ? 'secondary' : 'outline'
                        }>
                          {course.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{course.enrolledStudents} students</span>
                        <span>{course.totalModules} modules</span>
                        <span>{course.completionRate}% completion rate</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveView('roster-manager');
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Students
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedCourse(course);
                            setActiveView('course-editor');
                          }}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Course
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedCourse(course);
                            setActiveView('evaluation-builder');
                          }}>
                            <Award className="mr-2 h-4 w-4" />
                            Manage Evaluations
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Enrollments */}
          {mockPendingEnrollments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Enrollments</CardTitle>
                <CardDescription>Students waiting for approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockPendingEnrollments.map(student => (
                    <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Reject</Button>
                        <Button size="sm">Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2>My Courses</h2>
              <p className="text-muted-foreground">Manage and create your courses</p>
            </div>
            <Button onClick={() => {
              setSelectedCourse(null);
              setActiveView('course-editor');
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCourses.map(course => (
              <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant={
                      course.status === 'published' ? 'default' : 
                      course.status === 'draft' ? 'secondary' : 'outline'
                    }>
                      {course.status}
                    </Badge>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.enrolledStudents} students enrolled</span>
                      <span>{course.totalModules} modules</span>
                    </div>
                    
                    {course.status === 'published' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Completion Rate</span>
                          <span>{course.completionRate}%</span>
                        </div>
                        <Progress value={course.completionRate} />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveView('course-editor');
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveView('roster-manager');
                        }}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <h2>Student Management</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockCourses.filter(c => c.status === 'published').map(course => (
              <Card key={course.id}>
                <CardHeader>
                  <CardTitle>{course.title}</CardTitle>
                  <CardDescription>{course.enrolledStudents} enrolled students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Completion Rate</span>
                      <span>{course.completionRate}%</span>
                    </div>
                    <Progress value={course.completionRate} />
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveView('roster-manager');
                      }}
                    >
                      Manage Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <TeacherAnalytics courses={mockCourses} />
        </TabsContent>
      </Tabs>
    </div>
  );
}