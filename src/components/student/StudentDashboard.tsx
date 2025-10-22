import React, { useState, useEffect } from 'react';
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
  Star,
  FileText,
  CheckCircle,
  Calendar,
  Loader2,
  TrendingUp,
  Play,
  ExternalLink,
  Download,
  Eye
} from 'lucide-react';
import { Input } from '../ui/input';
import { useEnrollments, useCourses, useSubmissions, useAssignments } from '../../hooks/useFirestore';
import { FirestoreService, CourseModule } from '../../services/firestore.service';
import { formatDate, getTimeRemaining, isOverdue, getGradeLetter } from '../../utils/firebase-helpers';
import { toast } from 'sonner';
import { CourseViewer } from './CourseViewer';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
}

interface StudentDashboardProps {
  user: UserProfile;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  
  const { enrollments, loading: enrollmentsLoading } = useEnrollments(user.id);
  const { courses: allCourses, loading: coursesLoading } = useCourses();
  const { submissions, loading: submissionsLoading } = useSubmissions(undefined, user.id);
  
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);

  const loadCourseModules = async (courseId: string) => {
    try {
      console.log('StudentDashboard: Loading modules for course:', courseId);
      const modules = await FirestoreService.getCourseModules(courseId);
      console.log('StudentDashboard: Loaded modules:', modules);
      setCourseModules(modules);
    } catch (error) {
      console.error('StudentDashboard: Error loading course modules:', error);
      toast.error('Failed to load course modules');
    }
  };

  const handleViewCourse = async (course: any) => {
    setSelectedCourse(course);
    await loadCourseModules(course.id);
  };

  const handleBackToDashboard = () => {
    setSelectedCourse(null);
    setCourseModules([]);
  };

  useEffect(() => {
    const loadData = async () => {
      if (allCourses.length > 0) {
        const enrolledCourseIds = enrollments.map(e => e.course_id);
        
        // Get enrolled courses with details
        if (enrollments.length > 0) {
          const enrolled = await Promise.all(
            enrollments.map(async (enrollment) => {
              const course = allCourses.find(c => c.id === enrollment.course_id);
              if (!course) return null;
              
              const teacher = await FirestoreService.getUser(course.teacher_id);
              
              // Load course progress
              const courseProgress = await FirestoreService.getCourseProgress(user.id, course.id);
              
              return {
                ...course,
                enrollment,
                teacherName: teacher?.name || 'Unknown',
                progress: courseProgress?.progress_percentage || 0,
                completedModules: courseProgress?.completed_modules || 0,
                totalModules: courseProgress?.total_modules || 0
              };
            })
          );
          
          setEnrolledCourses(enrolled.filter(c => c !== null));
        } else {
          setEnrolledCourses([]);
        }
        
        // Get available courses
        const available = await Promise.all(
          allCourses
            .filter(c => !enrolledCourseIds.includes(c.id))
            .map(async (course) => {
              const teacher = await FirestoreService.getUser(course.teacher_id);
              return {
                ...course,
                teacherName: teacher?.name || 'Unknown',
              };
            })
        );
        
        setAvailableCourses(available);
        
        // Get assignments for enrolled courses
        if (enrolledCourseIds.length > 0) {
          const assignmentsPromises = enrolledCourseIds.map(courseId =>
            FirestoreService.getAssignmentsByCourse(courseId)
          );
          const allAssignments = (await Promise.all(assignmentsPromises)).flat();
          
          // Filter upcoming assignments
          const upcoming = allAssignments
            .filter(a => a.due_date && !isOverdue(a.due_date))
            .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
            .slice(0, 5);
          
          setUpcomingAssignments(upcoming);
        } else {
          setUpcomingAssignments([]);
        }
      }
    };

    loadData();
  }, [enrollments, allCourses]);

  const handleEnroll = async (courseId: string) => {
    try {
      const course = allCourses.find(c => c.id === courseId);
      if (!course) return;

      await FirestoreService.enrollStudent({
        student_id: user.id,
        course_id: courseId,
        progress: 0,
      });

      toast.success(`Successfully enrolled in ${course.title}`);
      
      // Refresh the page or update state
      window.location.reload();
    } catch (error: any) {
      toast.error('Failed to enroll in course');
      console.error(error);
    }
  };

  if (enrollmentsLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    activeCourses: enrolledCourses.length,
    averageProgress: enrolledCourses.length > 0
      ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / enrolledCourses.length)
      : 0,
    completedAssignments: submissions.filter(s => s.grade !== undefined).length,
    upcomingDue: upcomingAssignments.length,
  };

  if (selectedCourse) {
    return (
      <CourseViewer 
        course={{
          ...selectedCourse,
          instructor: 'Teacher', // You might want to fetch the actual teacher name
          progress: 0, // You might want to calculate actual progress
          status: 'active',
          duration: 'Self-paced',
          modules: courseModules.length
        }}
        onBack={handleBackToDashboard}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.completedAssignments}</div>
            <p className="text-xs text-muted-foreground">Assignments graded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.upcomingDue}</div>
            <p className="text-xs text-muted-foreground">Assignments due</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Don't miss these deadlines</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No upcoming assignments</p>
              ) : (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {getTimeRemaining(assignment.due_date)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Continue Learning */}
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </CardHeader>
            <CardContent>
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-6">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No enrolled courses</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse available courses to start your learning journey
                  </p>
                  <Button 
                    onClick={() => setActiveTab('courses')} 
                    size="sm"
                    variant="outline"
                  >
                    Browse Courses
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4>{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.teacherName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={course.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground">{course.progress}%</span>
                        </div>
                      </div>
                      <Button>Continue</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Enrolled Courses</CardTitle>
              <CardDescription>Courses you're currently taking</CardDescription>
            </CardHeader>
            <CardContent>
              {enrolledCourses.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No enrolled courses. Browse available courses to get started!
                </p>
              ) : (
                <div className="grid gap-4">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4>{course.title}</h4>
                          <p className="text-sm text-muted-foreground">{course.teacherName}</p>
                        </div>
                        <Badge>{course.progress}% Complete</Badge>
                      </div>
                      <p className="text-sm mb-3">{course.description}</p>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-muted-foreground mb-1">
                          <span>{course.completedModules || 0} of {course.totalModules || 0} modules completed</span>
                          <span>{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="mb-2" />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleViewCourse(course)}>
                          <Play className="mr-2 h-4 w-4" />
                          View Course
                        </Button>
                        <Button variant="outline">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4">
            {availableCourses
              .filter(course => 
                searchQuery === '' || 
                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                course.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((course) => (
                <Card key={course.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{course.title}</CardTitle>
                        <CardDescription>{course.teacherName}</CardDescription>
                      </div>
                      <Button onClick={() => handleEnroll(course.id)}>Enroll</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{course.description}</p>
                  </CardContent>
                </Card>
              ))}
            
            {availableCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses available</h3>
                <p className="text-muted-foreground mb-4">
                  Teachers haven't created any courses yet. Check back later or ask your instructor to create some courses.
                </p>
                <div className="text-sm text-muted-foreground">
                  <p>💡 <strong>Tip:</strong> Contact your teacher or administrator to get started with course content.</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <CardDescription>Track your assignment submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No assignments submitted yet</p>
              ) : (
                <div className="space-y-3">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">Assignment #{submission.assignment_id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Submitted {formatDate(submission.submitted_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {submission.grade !== undefined && submission.grade !== null ? (
                          <Badge variant="secondary">
                            Grade: {submission.grade} ({getGradeLetter(submission.grade)})
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
