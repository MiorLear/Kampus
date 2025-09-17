import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Bell, 
  Search,
  Filter,
  Star,
  Play,
  FileText,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';
import { Input } from '../ui/input';
import { CourseViewer } from './CourseViewer';
import { EvaluationPlayer } from './EvaluationPlayer';

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
  instructor: string;
  progress: number;
  status: 'active' | 'completed' | 'available';
  duration: string;
  modules: number;
  rating: number;
  cover?: string;
}

interface Evaluation {
  id: string;
  title: string;
  course: string;
  type: 'quiz' | 'assignment';
  status: 'pending' | 'submitted' | 'graded';
  score?: number;
  maxScore: number;
  dueDate: string;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the basics of HTML, CSS, and JavaScript',
    instructor: 'Dr. Sarah Martinez',
    progress: 65,
    status: 'active',
    duration: '6 weeks',
    modules: 12,
    rating: 4.8
  },
  {
    id: '2', 
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts and patterns',
    instructor: 'Prof. Miguel Rodriguez',
    progress: 100,
    status: 'completed',
    duration: '8 weeks',
    modules: 16,
    rating: 4.9
  },
  {
    id: '3',
    title: 'Database Design Fundamentals',
    description: 'Learn SQL and database design principles',
    instructor: 'Dr. Ana Garcia',
    progress: 0,
    status: 'available',
    duration: '4 weeks',
    modules: 8,
    rating: 4.7
  }
];

const mockEvaluations: Evaluation[] = [
  {
    id: '1',
    title: 'HTML & CSS Quiz',
    course: 'Introduction to Web Development',
    type: 'quiz',
    status: 'pending',
    maxScore: 100,
    dueDate: '2024-01-15'
  },
  {
    id: '2',
    title: 'React Components Assignment',
    course: 'Advanced React Patterns',
    type: 'assignment',
    status: 'graded',
    score: 95,
    maxScore: 100,
    dueDate: '2024-01-10'
  }
];

interface StudentDashboardProps {
  user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  if (activeView === 'course-viewer' && selectedCourse) {
    return (
      <CourseViewer 
        course={selectedCourse} 
        onBack={() => {
          setActiveView('dashboard');
          setSelectedCourse(null);
        }}
      />
    );
  }

  if (activeView === 'evaluation' && selectedEvaluation) {
    const evaluation = mockEvaluations.find(e => e.id === selectedEvaluation);
    if (evaluation) {
      return (
        <EvaluationPlayer
          evaluation={evaluation}
          onBack={() => {
            setActiveView('dashboard');
            setSelectedEvaluation(null);
          }}
          onSubmit={(answers) => {
            console.log('Submitted answers:', answers);
            setActiveView('dashboard');
            setSelectedEvaluation(null);
          }}
        />
      );
    }
  }

  const activeCourses = mockCourses.filter(c => c.status === 'active');
  const completedCourses = mockCourses.filter(c => c.status === 'completed');
  const availableCourses = mockCourses.filter(c => c.status === 'available');
  const pendingEvaluations = mockEvaluations.filter(e => e.status === 'pending');

  const filteredCourses = mockCourses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2">Welcome back, {user.name}!</h1>
        <p className="text-muted-foreground">Continue your learning journey</p>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="grades">My Grades</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Courses</p>
                    <p className="text-2xl font-bold">{activeCourses.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold">{completedCourses.length}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Evaluations</p>
                    <p className="text-2xl font-bold">{pendingEvaluations.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className="text-2xl font-bold">92%</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Courses */}
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Your active courses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeCourses.map(course => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Progress value={course.progress} className="flex-1 max-w-xs" />
                        <span className="text-sm text-muted-foreground">{course.progress}%</span>
                      </div>
                    </div>
                    <Button onClick={() => {
                      setSelectedCourse(course);
                      setActiveView('course-viewer');
                    }}>
                      <Play className="mr-2 h-4 w-4" />
                      Continue
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending Evaluations */}
          {pendingEvaluations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Evaluations</CardTitle>
                <CardDescription>Complete these evaluations before the due date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingEvaluations.map(evaluation => (
                    <Alert key={evaluation.id}>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>{evaluation.title}</strong> in {evaluation.course}
                            <div className="text-sm text-muted-foreground">
                              Due: {new Date(evaluation.dueDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => {
                              setSelectedEvaluation(evaluation.id);
                              setActiveView('evaluation');
                            }}
                          >
                            Take {evaluation.type === 'quiz' ? 'Quiz' : 'Assignment'}
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCourses.filter(c => c.status !== 'available').map(course => (
              <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <Badge variant={course.status === 'completed' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </div>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.instructor}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        {course.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.duration}</span>
                      <span>{course.modules} modules</span>
                    </div>
                    {course.status === 'active' && (
                      <div className="space-y-2">
                        <Progress value={course.progress} />
                        <span className="text-sm text-muted-foreground">{course.progress}% complete</span>
                      </div>
                    )}
                    <Button 
                      className="w-full"
                      onClick={() => {
                        setSelectedCourse(course);
                        setActiveView('course-viewer');
                      }}
                    >
                      {course.status === 'completed' ? 'Review' : 'Continue'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{course.instructor}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-current text-yellow-500" />
                        {course.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.duration}</span>
                      <span>{course.modules} modules</span>
                    </div>
                    <Button className="w-full" variant={course.status === 'available' ? 'default' : 'outline'}>
                      {course.status === 'available' ? 'Request Enrollment' : 'View Course'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Grades</CardTitle>
              <CardDescription>Your evaluation results and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEvaluations.map(evaluation => (
                  <div key={evaluation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{evaluation.title}</h3>
                        <Badge variant="outline">{evaluation.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{evaluation.course}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(evaluation.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {evaluation.status === 'graded' && evaluation.score !== undefined ? (
                        <>
                          <div className="text-right">
                            <p className="font-bold text-lg">{evaluation.score}/{evaluation.maxScore}</p>
                            <p className="text-sm text-muted-foreground">
                              {Math.round((evaluation.score / evaluation.maxScore) * 100)}%
                            </p>
                          </div>
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </>
                      ) : evaluation.status === 'submitted' ? (
                        <>
                          <span className="text-sm text-muted-foreground">Under Review</span>
                          <Clock className="h-6 w-6 text-orange-600" />
                        </>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground">Pending</span>
                          <XCircle className="h-6 w-6 text-red-600" />
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}