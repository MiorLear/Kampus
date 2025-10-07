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
import { CourseCatalog } from './CourseCatalog';
import { CourseDetail } from './CourseDetail';
import { MyCourses } from './MyCourses';
import { MyGrades } from './MyGrades';
import { ProfilePage } from './ProfilePage';

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
  onUpdateProfile?: (updates: any) => Promise<void>;
  onUpdatePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function StudentDashboard({ user, onUpdateProfile, onUpdatePassword }: StudentDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<Course | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);
  const [courses, setCourses] = useState<Course[]>(mockCourses);

  // Handle different views
  if (activeView === 'course-viewer' && selectedCourse) {
    return (
      <CourseViewer 
        course={selectedCourse} 
        onBack={() => {
          setActiveView('dashboard');
          setSelectedCourse(null);
        }}
        onProgressUpdate={async (courseId, progress) => {
          // Actualizar el progreso del curso en el estado
          setCourses(prev => prev.map(course => 
            course.id === courseId 
              ? { 
                  ...course, 
                  progress: progress,
                  status: progress === 100 ? 'completed' as const : course.status
                }
              : course
          ));
          console.log('Progress updated:', { courseId, progress });
        }}
        isArchived={selectedCourse.status === 'archived'}
      />
    );
  }

  if (activeView === 'course-detail' && selectedCourseForDetail) {
    return (
      <CourseDetail
        course={selectedCourseForDetail}
        onBack={() => {
          setActiveView('catalog');
          setSelectedCourseForDetail(null);
        }}
        onEnroll={(courseId) => {
          console.log('Enrollment requested for course:', courseId);
          setActiveView('catalog');
          setSelectedCourseForDetail(null);
        }}
        isEnrolled={mockCourses.some(c => c.id === selectedCourseForDetail.id && c.status !== 'available')}
        enrollmentStatus="pending"
      />
    );
  }

  if (activeView === 'evaluation' && selectedEvaluation) {
    const evaluation = evaluations.find(e => e.id === selectedEvaluation);
    if (evaluation) {
      return (
        <EvaluationPlayer
          evaluation={evaluation}
          onBack={() => {
            setActiveView('dashboard');
            setSelectedEvaluation(null);
          }}
          onSubmit={async (answers) => {
            console.log('Submitted answers:', answers);
            // Actualizar el estado de la evaluación
            setEvaluations(prev => prev.map(e => 
              e.id === selectedEvaluation 
                ? { ...e, status: 'submitted' as const }
                : e
            ));
            setActiveView('dashboard');
            setSelectedEvaluation(null);
          }}
          onSaveDraft={async (answers) => {
            console.log('Saved draft:', answers);
            // Aquí se podría implementar guardado en localStorage o backend
            localStorage.setItem(`evaluation-draft-${selectedEvaluation}`, JSON.stringify(answers));
          }}
        />
      );
    }
  }

  if (activeView === 'profile') {
    return (
      <ProfilePage
        user={{
          id: user.id,
          email: user.email,
          displayName: user.name,
          photoURL: undefined,
          role: 'student' as const,
          career: 'Computer Science',
          cohort: '2024 Spring',
          enrollmentDate: '2024-01-15',
          lastLogin: new Date().toISOString(),
          bio: 'Passionate about web development and learning new technologies.',
          phone: '+1 (555) 123-4567',
          dateOfBirth: '2000-05-15',
          preferences: {
            emailNotifications: true,
            courseUpdates: true,
            gradeNotifications: true,
            marketingEmails: false
          }
        }}
        onUpdateProfile={onUpdateProfile}
        onUpdatePassword={onUpdatePassword}
        onBack={() => setActiveView('dashboard')}
      />
    );
  }

  const activeCourses = courses.filter(c => c.status === 'active');
  const completedCourses = courses.filter(c => c.status === 'completed');
  const availableCourses = courses.filter(c => c.status === 'available');
  const pendingEvaluations = evaluations.filter(e => e.status === 'pending');

  const filteredCourses = courses.filter(course => 
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
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="grades">My Grades</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
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
          <MyCourses
            courses={courses}
            onCourseSelect={(course) => {
              setSelectedCourse(course);
              setActiveView('course-viewer');
            }}
            onViewGrades={(courseId) => {
              setActiveView('grades');
            }}
          />
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <CourseCatalog
            enrolledCourses={courses.filter(c => c.status === 'active' || c.status === 'completed').map(c => c.id)}
            onCourseSelect={(course) => {
              setSelectedCourseForDetail(course);
              setActiveView('course-detail');
            }}
            onEnrollmentRequest={(courseId) => {
              console.log('Enrollment requested for course:', courseId);
            }}
          />
        </TabsContent>

        <TabsContent value="grades" className="space-y-6">
          <MyGrades
            onViewSubmission={(submissionId) => {
              console.log('View submission:', submissionId);
            }}
            onDownloadFeedback={(submissionId) => {
              console.log('Download feedback for submission:', submissionId);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}