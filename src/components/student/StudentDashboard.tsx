import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
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
  Eye,
  MoreHorizontal,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import { Input } from '../ui/input';
import { useEnrollments, useCourses, useSubmissions, useAssignments } from '../../hooks/useFirestore';
import { CourseModule } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
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
  defaultTab?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  path: string;
}

// Define tabs outside component to avoid recreation
const STUDENT_TABS: Omit<TabItem, 'icon'>[] = [
  { id: 'overview', label: 'Overview', value: 'overview', path: '/dashboard' },
  { id: 'courses', label: 'My Courses', value: 'courses', path: '/mycourses' },
  { id: 'browse', label: 'Browse Courses', value: 'browse', path: '/browse' },
  { id: 'assignments', label: 'Assignments', value: 'assignments', path: '/assignments' },
];

export function StudentDashboard({ user, defaultTab }: StudentDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Create tabs with icons - use useMemo to prevent recreation on every render
  const allTabs: TabItem[] = useMemo(() => [
    { ...STUDENT_TABS[0], icon: <BarChart3 className="h-4 w-4" /> },
    { ...STUDENT_TABS[1], icon: <BookOpen className="h-4 w-4" /> },
    { ...STUDENT_TABS[2], icon: <Search className="h-4 w-4" /> },
    { ...STUDENT_TABS[3], icon: <FileText className="h-4 w-4" /> },
  ], []);

  // Initialize with all tabs visible, will be calculated on mount
  const [visibleTabs, setVisibleTabs] = useState<string[]>(STUDENT_TABS.map(t => t.value));
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);

  // Sync activeTab with URL
  useEffect(() => {
    const pathToTab = allTabs.find(tab => tab.path === location.pathname);
    if (pathToTab && pathToTab.value !== activeTab) {
      setActiveTab(pathToTab.value);
    }
  }, [location.pathname, allTabs, activeTab]);

  // Initialize from defaultTab or URL
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else {
      const pathToTab = allTabs.find(tab => tab.path === location.pathname);
      if (pathToTab) {
        setActiveTab(pathToTab.value);
      }
    }
  }, [defaultTab, location.pathname, allTabs]);

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const tab = allTabs.find(t => t.value === value);
    if (tab) {
      navigate(tab.path, { replace: true });
    }
  };

  // Dynamic tab visibility based on screen size
  useEffect(() => {
    const updateTabVisibility = () => {
      if (!tabsListRef.current || !tabsRef.current) {
        return false;
      }

      const containerWidth = tabsRef.current.offsetWidth;
      if (containerWidth === 0) {
        return false;
      }

      const dropdownButtonWidth = 120;
      const availableWidth = containerWidth - dropdownButtonWidth - 32;
      
      const tabsList = tabsListRef.current;
      const tabsListElement = tabsList?.querySelector('[data-slot="tabs-list"]') as HTMLElement;
      if (!tabsListElement) {
        return false;
      }
      
      const tabElements = Array.from(tabsListElement.children) as HTMLElement[];
      if (tabElements.length === 0) {
        return false;
      }
      
      let totalWidth = 0;
      const newVisibleTabs: string[] = [];
      const newHiddenTabs: string[] = [];

      for (const tab of allTabs) {
        const tabElement = tabElements.find(el => el.getAttribute('data-value') === tab.value);
        if (tabElement) {
          const tabWidth = tabElement.offsetWidth || 100;
          if (totalWidth + tabWidth <= availableWidth) {
            totalWidth += tabWidth;
            newVisibleTabs.push(tab.value);
          } else {
            newHiddenTabs.push(tab.value);
          }
        } else {
          const estimatedWidth = tab.label.length * 8 + 40;
          if (totalWidth + estimatedWidth <= availableWidth) {
            totalWidth += estimatedWidth;
            newVisibleTabs.push(tab.value);
          } else {
            newHiddenTabs.push(tab.value);
          }
        }
      }

      if (newVisibleTabs.length < 3) {
        newVisibleTabs.push(...newHiddenTabs.splice(0, 3 - newVisibleTabs.length));
      }

      setVisibleTabs(prev => {
        const prevSorted = [...prev].sort();
        const newSorted = [...newVisibleTabs].sort();
        if (JSON.stringify(prevSorted) !== JSON.stringify(newSorted)) {
          return newVisibleTabs;
        }
        return prev;
      });
      
      setHiddenTabs(prev => {
        const prevSorted = [...prev].sort();
        const newSorted = [...newHiddenTabs].sort();
        if (JSON.stringify(prevSorted) !== JSON.stringify(newSorted)) {
          return newHiddenTabs;
        }
        return prev;
      });
      
      return true;
    };

    const timeouts: NodeJS.Timeout[] = [];
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryUpdate = () => {
      attempts++;
      const success = updateTabVisibility();
      if (!success && attempts < maxAttempts) {
        timeouts.push(setTimeout(tryUpdate, 50));
      }
    };
    
    tryUpdate();
    requestAnimationFrame(() => {
      tryUpdate();
    });
    
    window.addEventListener('resize', updateTabVisibility);
    
    return () => {
      window.removeEventListener('resize', updateTabVisibility);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [allTabs]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseModules, setCourseModules] = useState<CourseModule[]>([]);
  
  const { enrollments, loading: enrollmentsLoading, refreshEnrollments } = useEnrollments(user.id);
  const { courses: allCourses, loading: coursesLoading, refreshCourses } = useCourses();
  const { submissions, loading: submissionsLoading } = useSubmissions(undefined, user.id);
  
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [overdueAssignments, setOverdueAssignments] = useState<any[]>([]);
  const [currentAssignmentFilter, setCurrentAssignmentFilter] = useState<'all' | 'overdue' | 'upcoming' | 'completed'>('all');

  const loadCourseModules = async (courseId: string) => {
    try {
      const modules = await ApiService.getCourseModules(courseId);
      setCourseModules(modules);
    } catch (error) {
      console.error('Error loading course modules:', error);
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

  // Reusable loadData function
  const loadData = useCallback(async () => {
    try {
      if (allCourses.length > 0) {
        const enrolledCourseIds = enrollments.map(e => e.course_id);
        
        // Get enrolled courses with details
        if (enrollments.length > 0) {
          const enrolled = await Promise.all(
            enrollments.map(async (enrollment) => {
              try {
                const course = allCourses.find(c => c.id === enrollment.course_id);
                if (!course) return null;
                
                const teacher = await ApiService.getUser(course.teacher_id).catch(() => null);
                const courseProgress = await ApiService.getCourseProgress(user.id, course.id).catch(() => null);
                
                return {
                  ...course,
                  enrollment,
                  teacherName: teacher?.name || 'Unknown',
                  progress: courseProgress?.progress_percentage || 0,
                  completedModules: courseProgress?.completed_modules || 0,
                  totalModules: courseProgress?.total_modules || 0
                };
              } catch (error) {
                console.error('Error loading enrolled course:', error);
                return null;
              }
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
              try {
                const teacher = await ApiService.getUser(course.teacher_id).catch(() => null);
                return {
                  ...course,
                  teacherName: teacher?.name || 'Unknown',
                };
              } catch (error) {
                console.error('Error loading available course:', error);
                return {
                  ...course,
                  teacherName: 'Unknown',
                };
              }
            })
        );
        
        setAvailableCourses(available);
        
        // Get assignments for enrolled courses
        if (enrolledCourseIds.length > 0) {
          try {
            const assignmentsPromises = enrolledCourseIds.map(courseId =>
              ApiService.getAssignmentsByCourse(courseId).catch(() => [])
            );
            const allAssignments = (await Promise.all(assignmentsPromises)).flat();
            
            // Filter upcoming and overdue assignments
            const upcoming = allAssignments
              .filter(a => a.due_date && !isOverdue(a.due_date))
              .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
              .slice(0, 5);
            
            const overdue = allAssignments
              .filter(a => a.due_date && isOverdue(a.due_date))
              .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
            
            setUpcomingAssignments(upcoming);
            setOverdueAssignments(overdue);
          } catch (error) {
            console.error('Error loading assignments:', error);
            setUpcomingAssignments([]);
            setOverdueAssignments([]);
          }
        } else {
          setUpcomingAssignments([]);
          setOverdueAssignments([]);
        }
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      setEnrolledCourses([]);
      setAvailableCourses([]);
      setUpcomingAssignments([]);
      setOverdueAssignments([]);
    }
  }, [enrollments, allCourses, user.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEnroll = async (courseId: string) => {
    try {
      console.log('[StudentDashboard] handleEnroll called with courseId:', courseId);
      console.log('[StudentDashboard] courseId type:', typeof courseId);
      console.log('[StudentDashboard] allCourses:', allCourses);
      
      const course = allCourses.find(c => c.id === courseId);
      if (!course) {
        console.error('[StudentDashboard] Course not found for ID:', courseId);
        toast.error('Course not found');
        return;
      }

      console.log('[StudentDashboard] Found course:', course);

      // Verificar si ya está inscrito
      const isAlreadyEnrolled = enrollments.some(e => e.course_id === courseId);
      if (isAlreadyEnrolled) {
        console.log('[StudentDashboard] Already enrolled in course');
        toast.info('You are already enrolled in this course');
        return;
      }

      console.log('[StudentDashboard] Calling ApiService.enrollStudent with:', {
        student_id: user.id,
        course_id: courseId,
        progress: 0
      });

      await ApiService.enrollStudent({
        student_id: user.id,
        course_id: courseId,
        progress: 0,
      });

      toast.success(`Successfully enrolled in ${course.title}`);
      
      // Refresh enrollments and courses
      refreshEnrollments();
      refreshCourses();
    } catch (error: any) {
      console.error('[StudentDashboard] Enrollment error:', error);
      console.error('[StudentDashboard] Error response:', error?.response);
      console.error('[StudentDashboard] Error response data:', error?.response?.data);
      
      const status = error?.response?.status;
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.error ||
                          error?.message || 
                          'Failed to enroll in course';
      
      if (status === 409 || errorMessage.includes('already enrolled')) {
        toast.info('You are already enrolled in this course');
        refreshEnrollments();
      } else if (status === 401) {
        toast.error('Please log in to enroll in courses');
      } else if (status === 400) {
        const detailedMessage = error?.response?.data?.message || errorMessage;
        console.error('[StudentDashboard] 400 Error details:', detailedMessage);
        toast.error(detailedMessage || 'Invalid request. Please check the course ID and try again.');
      } else {
        toast.error(errorMessage);
      }
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
    completedAssignments: submissions.filter(s => s.grade !== undefined && s.grade !== null).length,
    upcomingDue: upcomingAssignments.length,
    overdue: overdueAssignments.length,
  };

  if (selectedCourse) {
    return (
      <CourseViewer 
        course={{
          ...selectedCourse,
          instructor: selectedCourse.teacherName || 'Teacher',
          progress: selectedCourse.progress || 0,
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
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.name}!</h1>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageProgress}%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssignments}</div>
            <p className="text-xs text-muted-foreground mt-1">Assignments graded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingDue}</div>
            <p className="text-xs text-muted-foreground mt-1">Assignments due</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground mt-1">Past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div ref={tabsRef} className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div ref={tabsListRef} className="flex-1 min-w-0">
            <TabsList className="w-full">
              {allTabs.map((tab) => {
                const isVisible = visibleTabs.length === 0 || visibleTabs.includes(tab.value);
                if (!isVisible) return null;
                const isActive = activeTab === tab.value;
                return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.value}
                    data-value={tab.value}
                    className={isActive 
                      ? '!bg-primary !text-primary-foreground !shadow-md !font-semibold' 
                      : ''
                    }
                    style={isActive ? { 
                      backgroundColor: 'var(--primary)', 
                      color: 'var(--primary-foreground)',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
                      fontWeight: '600',
                      zIndex: 1
                    } : {}}
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                );
              }).filter(Boolean)}
            </TabsList>
          </div>
          
          {hiddenTabs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {allTabs
                  .filter(tab => hiddenTabs.includes(tab.value))
                  .map((tab) => (
                    <DropdownMenuItem 
                      key={tab.id}
                      onClick={() => handleTabChange(tab.value)}
                      className={activeTab === tab.value ? 'bg-primary/10 font-semibold' : ''}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <TabsContent value="overview" className="space-y-4">
          {/* Overdue Assignments Alert */}
          {overdueAssignments.length > 0 && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  Overdue Assignments
                </CardTitle>
                <CardDescription>These assignments are past their due date</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueAssignments.slice(0, 3).map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-3 border border-destructive/50 rounded-lg bg-destructive/5">
                      <div className="flex-1">
                        <p className="font-medium">{assignment.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Due {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                        </p>
                      </div>
                      <Badge variant="destructive">Overdue</Badge>
                    </div>
                  ))}
                  {overdueAssignments.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center">
                      And {overdueAssignments.length - 3} more overdue assignments
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

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
                    <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
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
                    onClick={() => handleTabChange('browse')} 
                    size="sm"
                  >
                    Browse Courses
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {enrolledCourses
                    .sort((a, b) => b.progress - a.progress)
                    .slice(0, 3)
                    .map((course) => (
                    <div key={course.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      {course.cover_image_url && (
                        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={course.cover_image_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.teacherName}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={course.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{course.progress}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {course.completedModules || 0} of {course.totalModules || 0} modules completed
                        </p>
                      </div>
                      <Button onClick={() => handleViewCourse(course)}>
                        <Play className="mr-2 h-4 w-4" />
                        Continue
                      </Button>
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
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No enrolled courses</h3>
                  <p className="text-muted-foreground mb-6">
                    Browse available courses to get started with your learning journey
                  </p>
                  <Button onClick={() => handleTabChange('browse')}>
                    Browse Courses
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {enrolledCourses.map((course) => (
                    <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      {course.cover_image_url && (
                        <div className="w-full h-48 overflow-hidden bg-muted">
                          <img
                            src={course.cover_image_url}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold">{course.title}</h4>
                            <p className="text-sm text-muted-foreground">{course.teacherName}</p>
                          </div>
                          <Badge variant="secondary" className="ml-2">
                            {course.progress}% Complete
                          </Badge>
                        </div>
                        <p className="text-sm mb-3 text-muted-foreground line-clamp-2">{course.description}</p>
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-muted-foreground mb-1">
                            <span>{course.completedModules || 0} of {course.totalModules || 0} modules completed</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => handleViewCourse(course)} className="flex-1">
                            <Play className="mr-2 h-4 w-4" />
                            View Course
                          </Button>
                          <Button variant="outline" onClick={() => handleViewCourse(course)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
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

          {availableCourses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses available</h3>
                  <p className="text-muted-foreground mb-4">
                    Teachers haven't created any courses yet. Check back later or ask your instructor to create some courses.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <p>💡 <strong>Tip:</strong> Contact your teacher or administrator to get started with course content.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {availableCourses
                .filter(course => 
                  searchQuery === '' || 
                  course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  course.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  course.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    {course.cover_image_url && (
                      <div className="w-full h-48 overflow-hidden bg-muted">
                        <img
                          src={course.cover_image_url}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle>{course.title}</CardTitle>
                          <CardDescription>{course.teacherName}</CardDescription>
                        </div>
                        <Button 
                          onClick={() => {
                            console.log('[StudentDashboard] Enroll button clicked for course:', course);
                            console.log('[StudentDashboard] Course ID:', course.id);
                            if (!course.id) {
                              console.error('[StudentDashboard] Course ID is missing!');
                              toast.error('Course ID is missing. Please refresh the page.');
                              return;
                            }
                            handleEnroll(course.id);
                          }}
                          className="ml-4"
                        >
                          Enroll
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
            <h2 className="text-xl font-semibold">Your Assignments</h2>
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              {(['all', 'overdue', 'upcoming', 'completed'] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={currentAssignmentFilter === filter ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentAssignmentFilter(filter)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <CardDescription>Track your upcoming tasks and past submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingAssignments.length === 0 && overdueAssignments.length === 0 && submissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No assignments found</h3>
                  <p className="text-muted-foreground">
                    You don't have any pending or submitted assignments yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Overdue Section */}
                  {(currentAssignmentFilter === 'all' || currentAssignmentFilter === 'overdue') && overdueAssignments.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-destructive flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Overdue ({overdueAssignments.length})
                      </h3>
                      {overdueAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                          <div className="flex-1">
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Due {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="destructive" className="mr-2">Overdue</Badge>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (assignment.course_id) {
                                   const course = allCourses.find(c => c.id === assignment.course_id);
                                   if (course) {
                                     handleViewCourse(course);
                                   } else {
                                     toast.error('Course not found');
                                   }
                                }
                              }}
                            >
                              Late Submit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upcoming Section */}
                  {(currentAssignmentFilter === 'all' || currentAssignmentFilter === 'upcoming') && upcomingAssignments.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Upcoming ({upcomingAssignments.length})
                      </h3>
                      {upcomingAssignments.map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium">{assignment.title}</p>
                            <p className="text-sm text-muted-foreground">
                              Due {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="mr-2">
                              {getTimeRemaining(assignment.due_date)}
                            </Badge>
                            <Button
                              size="sm"
                              onClick={() => {
                                // We need to find the course this assignment belongs to.
                                // assignment object should ideally have course_id.
                                if (assignment.course_id) {
                                   const course = allCourses.find(c => c.id === assignment.course_id);
                                   if (course) {
                                     handleViewCourse(course);
                                     // Ideally we would also pass the assignment ID to auto-open it
                                   } else {
                                     toast.error('Course not found');
                                   }
                                } else {
                                   toast.error('Cannot navigate to course');
                                }
                              }}
                            >
                              Start
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submissions Section */}
                  {(currentAssignmentFilter === 'all' || currentAssignmentFilter === 'completed') && submissions.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Submitted ({submissions.length})
                      </h3>
                      {submissions.map((submission) => (
                        <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium">Assignment #{submission.assignment_id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              Submitted {formatDate(submission.submitted_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {submission.grade !== undefined && submission.grade !== null ? (
                              <Badge variant="secondary" className="text-base px-3 py-1">
                                {submission.grade}% ({getGradeLetter(submission.grade)})
                              </Badge>
                            ) : (
                              <Badge variant="outline">Pending Grading</Badge>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                // Find course for this assignment if possible and navigate
                                // For now, we unfortunately don't have direct course linkage in the submission view easily accessible without looking it up
                                // But we can try to find the course from the assignment ID if we have a mapping or just show a toast if we can't deep direct.
                                // Ideally, we'd navigate to: /mycourses -> Select Course -> Select Module
                                toast.info('Go to "My Courses" to view this assignment details.');
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Empty state filters */}
                  {currentAssignmentFilter !== 'all' && 
                   ((currentAssignmentFilter === 'overdue' && overdueAssignments.length === 0) ||
                    (currentAssignmentFilter === 'upcoming' && upcomingAssignments.length === 0) ||
                    (currentAssignmentFilter === 'completed' && submissions.length === 0)) && (
                    <div className="text-center py-12 text-muted-foreground">
                      No {currentAssignmentFilter} assignments found.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
