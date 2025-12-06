import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Progress } from '../ui/progress';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus,
  Edit,
  FileText,
  Clock,
  Loader2,
  CheckCircle,
  MoreHorizontal,
  BarChart3,
  Layers
} from 'lucide-react';
import { useCourses, useAssignments, useSubmissions, useEnrollments } from '../../hooks/useFirestore';
import { ApiService } from '../../services/api.service';
import { formatDate, getTimeRemaining } from '../../utils/firebase-helpers';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AssignmentEditor } from '../admin/AssignmentEditor';
import { CourseEditor } from './CourseEditor';
import { CoverImageUpload } from '../admin/CoverImageUpload';
import { CourseModulesDialog } from '../admin/CourseModulesDialog';
import { TeacherAnalytics } from './TeacherAnalytics';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
}

interface TeacherDashboardProps {
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
const TEACHER_TABS: Omit<TabItem, 'icon'>[] = [
  { id: 'overview', label: 'Overview', value: 'overview', path: '/dashboard' },
  { id: 'courses', label: 'My Courses', value: 'courses', path: '/teacher/courses' },
  { id: 'modules', label: 'Modules', value: 'modules', path: '/teacher/modules' },
  { id: 'assignments', label: 'Assignments', value: 'assignments', path: '/teacher/assignments' },
  { id: 'grading', label: 'Grading', value: 'grading', path: '/teacher/grading' },
];

export function TeacherDashboard({ user, defaultTab }: TeacherDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Create tabs with icons - use useMemo to prevent recreation on every render
  const allTabs: TabItem[] = useMemo(() => [
    { ...TEACHER_TABS[0], icon: <BarChart3 className="h-4 w-4" /> },
    { ...TEACHER_TABS[1], icon: <BookOpen className="h-4 w-4" /> },
    { ...TEACHER_TABS[2], icon: <Layers className="h-4 w-4" /> },
    { ...TEACHER_TABS[3], icon: <FileText className="h-4 w-4" /> },
    { ...TEACHER_TABS[4], icon: <CheckCircle className="h-4 w-4" /> },
  ], []);

  // Initialize with all tabs visible, will be calculated on mount
  const [visibleTabs, setVisibleTabs] = useState<string[]>(TEACHER_TABS.map(t => t.value));
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
    try {
      console.log('Tab changed to:', value, 'Current activeTab:', activeTab);
      setActiveTab(value);
      const tab = allTabs.find(t => t.value === value);
      if (tab) {
        navigate(tab.path, { replace: true });
      } else {
        console.warn('Tab not found:', value, 'Available tabs:', allTabs.map(t => t.value));
      }
    } catch (error) {
      console.error('Error in handleTabChange:', error);
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

      const dropdownButtonWidth = 120; // Approximate width of dropdown button
      const availableWidth = containerWidth - dropdownButtonWidth - 32; // 32px for padding/margins
      
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
          const tabWidth = tabElement.offsetWidth || 100; // Fallback width
          if (totalWidth + tabWidth <= availableWidth) {
            totalWidth += tabWidth;
            newVisibleTabs.push(tab.value);
          } else {
            newHiddenTabs.push(tab.value);
          }
        } else {
          // If tab is not rendered yet, estimate width
          const estimatedWidth = tab.label.length * 8 + 40; // Rough estimate
          if (totalWidth + estimatedWidth <= availableWidth) {
            totalWidth += estimatedWidth;
            newVisibleTabs.push(tab.value);
          } else {
            newHiddenTabs.push(tab.value);
          }
        }
      }

      // Always show at least the first 3 tabs
      if (newVisibleTabs.length < 3) {
        newVisibleTabs.push(...newHiddenTabs.splice(0, 3 - newVisibleTabs.length));
      }

      // Only update if values actually changed to prevent infinite loops
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

    // Use multiple attempts to ensure DOM is ready
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
    
    // Start trying immediately
    tryUpdate();
    
    // Also try after next frame
    requestAnimationFrame(() => {
      tryUpdate();
    });
    
    window.addEventListener('resize', updateTabVisibility);
    
    return () => {
      window.removeEventListener('resize', updateTabVisibility);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [allTabs]); // Remove activeTab dependency to prevent infinite loops
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showAssignmentEditor, setShowAssignmentEditor] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [showCourseDetails, setShowCourseDetails] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<any>(null);
  const [showCourseEditor, setShowCourseEditor] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [showEditCourseDialog, setShowEditCourseDialog] = useState(false);
  const [editCourseTitle, setEditCourseTitle] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [editCourseCoverImage, setEditCourseCoverImage] = useState<string | null>(null);
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
  
  const { courses, loading: coursesLoading, refreshCourses } = useCourses(user.id);
  const { refreshEnrollments } = useEnrollments();
  
  const [courseEnrollments, setCourseEnrollments] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [loadingAllModules, setLoadingAllModules] = useState(false);
  const [showModulesDialog, setShowModulesDialog] = useState(false);
  const [selectedCourseForModules, setSelectedCourseForModules] = useState<any>(null);
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    cover_image_url: null as string | null,
  });

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
    module_id: '',
  });
  const [courseModules, setCourseModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  // Reusable loadData function
  const loadData = useCallback(async () => {
    try {
      if (courses.length > 0) {
        setLoadingAllModules(true);
        // Execute all independent fetch operations in parallel
        const [allEnrollments, allAssignmentsData, allSubmissionsData, allModulesData] = await Promise.all([
          ApiService.getAllEnrollments().catch(() => []),
          ApiService.getAllAssignments().catch(() => []),
          ApiService.getAllSubmissions().catch(() => []), 
          // Note: If getAllModules existed we would use it, but for now we optimizes module fetching 
          // or keep it as is if no bulk endpoint. 
          // Actually, let's keep modules as is for now or try to optimize if possible, 
          // but modules are usually fetched lazily or we can iterate. 
          // Given the plan focused on enrollments/assignments/submissions, let's process those first.
          // However, for proper parallelism we can still map courses for modules if needed, 
          // but let's stick to the plan of optimizing N+1 for the heavy hitters (enrollments/assignments).
          // For modules, we'll keep the promise.all map as it depends on course IDs and might not have a "getAll" equivalent easily exposed yet without backend changes.
          // BUT, to avoid blocking the other requests, we run this concurrently.
          Promise.all(courses.map(c => 
            ApiService.getCourseModules(c.id)
              .then(modules => Array.isArray(modules) ? modules : [])
              .catch(() => [])
          ))
        ]);

        // Process Enrollments
        const courseIds = new Set(courses.map(c => c.id));
        const filteredEnrollments = allEnrollments.filter(e => courseIds.has(e.course_id));
        setCourseEnrollments(filteredEnrollments);

        // Process Assignments
        const filteredAssignments = allAssignmentsData.filter(a => courseIds.has(a.course_id));
        setAllAssignments(filteredAssignments);

        // Process Submissions
        // We need submissions that belong to our assignments
        const assignmentIds = new Set(filteredAssignments.map(a => a.id));
        const filteredSubmissions = allSubmissionsData.filter(s => assignmentIds.has(s.assignment_id));
        setAllSubmissions(filteredSubmissions);
        
        const pending = filteredSubmissions.filter(s => 
          s && (s.grade === undefined || s.grade === null)
        );
        setPendingSubmissions(pending);

        // Process Modules
        const flatModules = allModulesData
          .flat()
          .filter(module => module != null && typeof module === 'object')
          .map(module => {
            const course = courses.find(c => c.id === module.course_id);
            return {
              ...module,
              course_title: course?.title || 'Unknown Course'
            };
          });
        setAllModules(flatModules);
        setLoadingAllModules(false);

      } else {
        setCourseEnrollments([]);
        setAllAssignments([]);
        setAllSubmissions([]);
        setPendingSubmissions([]);
        setAllModules([]);
        setLoadingAllModules(false);
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      setCourseEnrollments([]);
      setAllAssignments([]);
      setAllSubmissions([]);
      setPendingSubmissions([]);
      setAllModules([]);
      setLoadingAllModules(false);
    }
  }, [courses]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim()) {
      toast.error('Course title is required');
      return;
    }

    try {
      await ApiService.createCourse({
        title: newCourse.title.trim(),
        description: newCourse.description.trim() || undefined,
        teacher_id: user.id,
        cover_image_url: newCourse.cover_image_url || undefined,
      });

      toast.success('Course created successfully!');
      setShowCreateCourse(false);
      setNewCourse({ title: '', description: '', cover_image_url: null });
      // Refresh courses list - useEffect will automatically trigger loadData when courses change
      await refreshCourses();
    } catch (error) {
      toast.error('Failed to create course');
      console.error(error);
    }
  };

  // Load modules when course is selected for assignment creation
  useEffect(() => {
    const loadModulesForAssignment = async () => {
      if (selectedCourse && showCreateAssignment) {
        setLoadingModules(true);
        try {
          const modules = await ApiService.getCourseModules(selectedCourse);
          setCourseModules(modules);
        } catch (error) {
          console.error('Error loading modules:', error);
          toast.error('Failed to load course modules');
          setCourseModules([]);
        } finally {
          setLoadingModules(false);
        }
      } else {
        setCourseModules([]);
      }
    };

    loadModulesForAssignment();
  }, [selectedCourse, showCreateAssignment]);

  const handleCreateAssignment = async () => {
    if (!selectedCourse || !newAssignment.title || !newAssignment.description) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!newAssignment.module_id) {
      toast.error('Please select a module');
      return;
    }

    try {
      await ApiService.createAssignment({
        course_id: selectedCourse,
        module_id: newAssignment.module_id,
        title: newAssignment.title,
        description: newAssignment.description,
        due_date: newAssignment.due_date || undefined,
      });

      toast.success('Assignment created successfully!');
      setShowCreateAssignment(false);
      setNewAssignment({ title: '', description: '', due_date: '', module_id: '' });
      setSelectedCourse(null);
      
      // Refresh assignments reactively - stays on same route
      await loadData();
    } catch (error) {
      toast.error('Failed to create assignment');
      console.error(error);
    }
  };

  const handleEditAssignment = (assignment: any) => {
    setEditingAssignment(assignment);
    setShowAssignmentEditor(true);
  };

  const handleCreateNewAssignment = () => {
    setEditingAssignment(null);
    setShowAssignmentEditor(true);
  };

  const handleAssignmentEditorSave = () => {
    loadData();
    setShowAssignmentEditor(false);
    setEditingAssignment(null);
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourseDetails(course);
    setShowCourseDetails(true);
  };

  const handleEditCourse = (course: any) => {
    setEditingCourse(course);
    setEditCourseTitle(course.title || '');
    setEditCourseDescription(course.description || '');
    setEditCourseCoverImage(course.cover_image_url || null);
    setShowEditCourseDialog(true);
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse || !editCourseTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsUpdatingCourse(true);
    try {
      await ApiService.updateCourse(editingCourse.id, {
        title: editCourseTitle.trim(),
        description: editCourseDescription.trim(),
        cover_image_url: editCourseCoverImage || undefined,
      });
      toast.success('Course updated successfully');
      setShowEditCourseDialog(false);
      setEditingCourse(null);
      await refreshCourses();
    } catch (error) {
      toast.error('Failed to update course');
      console.error(error);
    } finally {
      setIsUpdatingCourse(false);
    }
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    totalCourses: courses.length,
    totalStudents: courseEnrollments.length,
    totalAssignments: allAssignments.length,
    pendingGrading: pendingSubmissions.length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and students</p>
        </div>
        <Button onClick={() => setShowCreateCourse(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Create Course Dialog */}
      <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>Add a new course to your teaching portfolio</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Course Title *</Label>
              <Input
                id="title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="e.g., Introduction to Web Development"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Describe what students will learn..."
                rows={4}
              />
            </div>
            <CoverImageUpload
              currentImageUrl={newCourse.cover_image_url || undefined}
              onImageChange={(url) => setNewCourse({ ...newCourse, cover_image_url: url })}
              courseTitle={newCourse.title}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setShowCreateCourse(false);
                setNewCourse({ title: '', description: '', cover_image_url: null });
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse} disabled={!newCourse.title.trim()}>
                Create Course
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Created assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pendingGrading}</div>
            <p className="text-xs text-muted-foreground">To grade</p>
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
          <TeacherAnalytics 
            courses={courses} 
            enrollments={courseEnrollments} 
            assignments={allAssignments} 
            submissions={allSubmissions} 
          />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Courses</CardTitle>
                  <CardDescription>Manage your courses</CardDescription>
                </div>
                <Button onClick={() => setShowCreateCourse(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
                  <h3 className="text-lg font-medium mb-2">No courses created yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first course to start teaching students and sharing knowledge
                  </p>
                  <div className="space-y-3">
                    <Button onClick={() => setShowCreateCourse(true)} size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Course
                    </Button>
                    <div className="text-sm text-muted-foreground">
                      <p>💡 <strong>Tip:</strong> You can also click "Initialize Sample Data" when you first login to get started with sample courses.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => {
                    const enrollments = courseEnrollments.filter(e => e.course_id === course.id);
                    const assignments = allAssignments.filter(a => a.course_id === course.id);
                    
                    return (
                      <div key={course.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4>{course.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {enrollments.length} students • {assignments.length} assignments
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCourse(course.id);
                                setShowCreateAssignment(true);
                              }}
                            >
                              Add Assignment
                            </Button>
                            <Button 
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditCourse(course)}
                            >
                              <Edit className="mr-1 h-3 w-3" />
                              Edit Course
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleViewCourse(course)}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm">{course.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Modules</CardTitle>
                  <CardDescription>Manage modules across all your courses</CardDescription>
                </div>
                <Button 
                  onClick={() => {
                    if (!courses || courses.length === 0) {
                      toast.error('Please create a course first');
                      return;
                    }
                    if (courses.length === 1) {
                      // If only one course, open modules dialog directly
                      setSelectedCourseForModules(courses[0]);
                      setShowModulesDialog(true);
                    } else {
                      toast.info('Select a course below to manage its modules');
                    }
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAllModules ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading modules...</span>
                </div>
              ) : !courses || courses.length === 0 ? (
                <div className="text-center py-12">
                  <Layers className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses available</h3>
                  <p className="text-muted-foreground mb-6">
                    Create a course first, then add modules to organize your content.
                  </p>
                  <Button onClick={() => setShowCreateCourse(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => {
                    if (!course || !course.id) return null;
                    
                    // Safely filter modules, ensuring allModules is an array
                    const courseModules = Array.isArray(allModules) 
                      ? allModules.filter(m => 
                          m && 
                          typeof m === 'object' && 
                          m.course_id === course.id
                        )
                      : [];
                    
                    return (
                      <div key={course.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{course.title || 'Untitled Course'}</h4>
                            <p className="text-sm text-muted-foreground">
                              {courseModules.length === 0 
                                ? 'No modules yet' 
                                : `${courseModules.length} module${courseModules.length !== 1 ? 's' : ''}`}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (course) {
                                setSelectedCourseForModules(course);
                                setShowModulesDialog(true);
                              }
                            }}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            {courseModules.length === 0 ? 'Add Modules' : 'Manage Modules'}
                          </Button>
                        </div>
                        {courseModules.length === 0 ? (
                          <div className="text-center py-6 border-t mt-3">
                            <p className="text-sm text-muted-foreground mb-3">
                              This course doesn't have any modules yet.
                            </p>
                            <Button
                              size="sm"
                              onClick={() => {
                                if (course) {
                                  setSelectedCourseForModules(course);
                                  setShowModulesDialog(true);
                                }
                              }}
                            >
                              <Plus className="mr-2 h-3 w-3" />
                              Add First Module
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {courseModules.slice(0, 5).map((module) => {
                              // Safety check for module data
                              if (!module || !module.id) return null;
                              
                              return (
                                <div key={module.id} className="flex items-center justify-between p-2 border rounded bg-muted/50">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{module.type || 'unknown'}</Badge>
                                    <span className="text-sm font-medium">{module.title || 'Untitled Module'}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Order: {module.order ?? 0}
                                  </span>
                                </div>
                              );
                            })}
                            {courseModules.length > 5 && (
                              <p className="text-xs text-muted-foreground text-center">
                                And {courseModules.length - 5} more module{courseModules.length - 5 !== 1 ? 's' : ''}...
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Assignments</CardTitle>
                  <CardDescription>Manage course assignments</CardDescription>
                </div>
                <Button onClick={handleCreateNewAssignment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {allAssignments.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No assignments created yet</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create assignments for your courses to engage students
                  </p>
                  <Button onClick={handleCreateNewAssignment} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Assignment
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {allAssignments.map((assignment) => {
                    const course = courses.find(c => c.id === assignment.course_id);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">{course?.title}</p>
                          {assignment.due_date && (
                            <p className="text-xs text-muted-foreground">
                              Due: {formatDate(assignment.due_date)}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditAssignment(assignment)}
                        >
                          Edit
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submissions to Grade</CardTitle>
              <CardDescription>Review and grade student work</CardDescription>
            </CardHeader>
            <CardContent>
              {!pendingSubmissions || pendingSubmissions.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">
                    No pending submissions to grade at this time.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingSubmissions.map((submission) => {
                    if (!submission || !submission.id) return null;
                    
                    return (
                      <div key={submission.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">
                              Assignment #{submission.assignment_id ? submission.assignment_id.slice(0, 8) : 'N/A'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Student ID: {submission.student_id ? submission.student_id.slice(0, 8) : 'N/A'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Submitted: {submission.submitted_at ? formatDate(submission.submitted_at) : 'Unknown'}
                            </p>
                          </div>
                          <Button size="sm">Grade Now</Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateAssignment} onOpenChange={setShowCreateAssignment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>Add an assignment to your course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignment-title">Assignment Title *</Label>
              <Input
                id="assignment-title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                placeholder="e.g., Module 1 Quiz"
              />
            </div>
            <div>
              <Label htmlFor="assignment-module">Module *</Label>
              {loadingModules ? (
                <div className="flex items-center gap-2 p-3 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading modules...</span>
                </div>
              ) : courseModules.length === 0 ? (
                <div className="p-3 border border-amber-200 bg-amber-50 rounded-md">
                  <p className="text-sm text-amber-800">
                    No modules available for this course. Please create modules first.
                  </p>
                </div>
              ) : (
                <Select
                  value={newAssignment.module_id}
                  onValueChange={(value) => setNewAssignment({ ...newAssignment, module_id: value })}
                >
                  <SelectTrigger id="assignment-module" className="w-full">
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {courseModules.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({module.type})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {courseModules.length > 0 && !newAssignment.module_id && (
                <p className="text-xs text-amber-600 mt-1">
                  Please select a module to associate this assignment with.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="assignment-description">Description *</Label>
              <Textarea
                id="assignment-description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Describe the assignment..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateAssignment(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateAssignment}
                disabled={!newAssignment.title || !newAssignment.description || !newAssignment.module_id}
              >
                Create Assignment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Editor Dialog */}
      <AssignmentEditor
        open={showAssignmentEditor}
        onOpenChange={setShowAssignmentEditor}
        assignment={editingAssignment}
        courses={courses}
        onSave={handleAssignmentEditorSave}
      />

      {/* Course Editor */}
      {showCourseEditor && editingCourse && (
        <CourseEditor
          course={editingCourse}
          onBack={async () => {
            setShowCourseEditor(false);
            setEditingCourse(null);
            // Refresh courses list - useEffect will automatically trigger loadData when courses change
            await refreshCourses();
          }}
        />
      )}

      {/* Course Details Modal */}
      <Dialog open={showCourseDetails} onOpenChange={setShowCourseDetails}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourseDetails?.title}</DialogTitle>
            <DialogDescription>
              Course details and management
            </DialogDescription>
          </DialogHeader>
          
          {selectedCourseDetails && (
            <div className="space-y-6">
              {/* Course Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedCourseDetails.description || 'No description provided'}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Course Stats</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Students:</span>
                        <span>{courseEnrollments.filter(e => e.course_id === selectedCourseDetails.id).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Assignments:</span>
                        <span>{allAssignments.filter(a => a.course_id === selectedCourseDetails.id).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created:</span>
                        <span>{selectedCourseDetails.created_at ? formatDate(selectedCourseDetails.created_at) : 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Course Actions</h3>
                    <div className="space-y-2">
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => {
                          setSelectedCourse(selectedCourseDetails.id);
                          setShowCreateAssignment(true);
                          setShowCourseDetails(false);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Assignment
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          handleEditCourse(selectedCourseDetails);
                          setShowCourseDetails(false);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Course
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Assignments */}
              {(() => {
                const courseAssignments = allAssignments.filter(a => a.course_id === selectedCourseDetails.id);
                return courseAssignments.length > 0 ? (
                  <div>
                    <h3 className="font-medium mb-3">Recent Assignments</h3>
                    <div className="space-y-2">
                      {courseAssignments.slice(0, 3).map((assignment) => (
                        <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{assignment.title}</p>
                            {assignment.due_date && (
                              <p className="text-xs text-muted-foreground">
                                Due: {formatDate(assignment.due_date)}
                              </p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingAssignment(assignment);
                              setShowAssignmentEditor(true);
                              setShowCourseDetails(false);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {courseAssignments.length > 3 && (
                        <p className="text-xs text-muted-foreground text-center">
                          And {courseAssignments.length - 3} more assignments...
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No assignments yet</p>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => {
                        setSelectedCourse(selectedCourseDetails.id);
                        setShowCreateAssignment(true);
                        setShowCourseDetails(false);
                      }}
                    >
                      Create First Assignment
                    </Button>
                  </div>
                );
              })()}
            </div>
          )}
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowCourseDetails(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={showEditCourseDialog} onOpenChange={setShowEditCourseDialog}>
        <DialogContent className="max-h-[90vh] w-[70vw] overflow-y-auto" style={{ maxWidth: '70vw' }}>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={editCourseTitle}
                onChange={(e) => setEditCourseTitle(e.target.value)}
                placeholder="Course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editCourseDescription}
                onChange={(e) => setEditCourseDescription(e.target.value)}
                placeholder="Course description"
                rows={5}
              />
            </div>
            {editingCourse && (
              <div className="text-sm text-muted-foreground">
                <p>Created: {formatDate(editingCourse.created_at)}</p>
              </div>
            )}
            <CoverImageUpload
              currentImageUrl={editCourseCoverImage || undefined}
              onImageChange={setEditCourseCoverImage}
              courseTitle={editCourseTitle}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditCourseDialog(false);
                setEditingCourse(null);
              }}
              disabled={isUpdatingCourse}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCourse}
              disabled={isUpdatingCourse || !editCourseTitle.trim()}
            >
              {isUpdatingCourse ? 'Updating...' : 'Update Course'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Course Modules Dialog */}
      <CourseModulesDialog
        open={showModulesDialog}
        onOpenChange={(open) => {
          setShowModulesDialog(open);
          if (!open) {
            // Reload modules when dialog closes
            loadData();
          }
        }}
        course={selectedCourseForModules}
      />
    </div>
  );
}
