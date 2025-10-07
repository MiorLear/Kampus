import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Search, 
  Filter, 
  Play, 
  BookOpen, 
  Clock, 
  Star, 
  Trophy,
  Archive,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  duration: string;
  modules: number;
  rating: number;
  enrolledStudents: number;
  maxStudents?: number;
  cover?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  enrollmentDate: string;
  progress: number;
  completedModules: number;
  totalModules: number;
  lastAccessed?: string;
  isArchived: boolean;
  status: 'active' | 'completed' | 'paused';
}

interface MyCoursesProps {
  onCourseSelect?: (course: Course) => void;
  onViewGrades?: (courseId: string) => void;
  courses?: Course[];
}

const mockEnrolledCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.',
    instructor: 'Dr. Sarah Martinez',
    instructorId: 'instructor1',
    level: 'beginner',
    tags: ['HTML', 'CSS', 'JavaScript', 'Web Development'],
    duration: '6 weeks',
    modules: 12,
    rating: 4.8,
    enrolledStudents: 245,
    maxStudents: 300,
    isPublished: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    enrollmentDate: '2024-01-10',
    progress: 65,
    completedModules: 8,
    totalModules: 12,
    lastAccessed: '2024-01-20',
    isArchived: false,
    status: 'active'
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts including hooks, context, and performance optimization.',
    instructor: 'Prof. Miguel Rodriguez',
    instructorId: 'instructor2',
    level: 'advanced',
    tags: ['React', 'JavaScript', 'Frontend', 'Hooks'],
    duration: '8 weeks',
    modules: 16,
    rating: 4.9,
    enrolledStudents: 189,
    maxStudents: 200,
    isPublished: true,
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20',
    enrollmentDate: '2024-01-12',
    progress: 100,
    completedModules: 16,
    totalModules: 16,
    lastAccessed: '2024-01-25',
    isArchived: false,
    status: 'completed'
  },
  {
    id: '3',
    title: 'Database Design Fundamentals',
    description: 'Learn SQL and database design principles for scalable applications.',
    instructor: 'Dr. Ana Garcia',
    instructorId: 'instructor3',
    level: 'intermediate',
    tags: ['SQL', 'Database', 'Backend', 'Design'],
    duration: '4 weeks',
    modules: 8,
    rating: 4.7,
    enrolledStudents: 156,
    maxStudents: 250,
    isPublished: true,
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    enrollmentDate: '2024-01-15',
    progress: 25,
    completedModules: 2,
    totalModules: 8,
    lastAccessed: '2024-01-18',
    isArchived: false,
    status: 'active'
  },
  {
    id: '4',
    title: 'Python for Data Science',
    description: 'Comprehensive introduction to Python programming for data analysis and visualization.',
    instructor: 'Dr. Carlos Lopez',
    instructorId: 'instructor4',
    level: 'beginner',
    tags: ['Python', 'Data Science', 'Pandas', 'NumPy'],
    duration: '10 weeks',
    modules: 20,
    rating: 4.6,
    enrolledStudents: 312,
    maxStudents: 400,
    isPublished: true,
    createdAt: '2024-01-12',
    updatedAt: '2024-01-22',
    enrollmentDate: '2023-12-01',
    progress: 100,
    completedModules: 20,
    totalModules: 20,
    lastAccessed: '2024-01-15',
    isArchived: true,
    status: 'completed'
  }
];

export function MyCourses({ onCourseSelect, onViewGrades, courses: propCourses }: MyCoursesProps) {
  const [courses, setCourses] = useState<Course[]>(propCourses || mockEnrolledCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(propCourses || mockEnrolledCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('lastAccessed');

  // Actualizar cursos cuando cambien los props
  useEffect(() => {
    if (propCourses) {
      setCourses(propCourses);
    }
  }, [propCourses]);

  // Filter and sort courses
  useEffect(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'lastAccessed':
          if (!a.lastAccessed && !b.lastAccessed) return 0;
          if (!a.lastAccessed) return 1;
          if (!b.lastAccessed) return -1;
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        case 'progress':
          return b.progress - a.progress;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'enrollmentDate':
          return new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, statusFilter, sortBy]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeCourses = courses.filter(c => c.status === 'active' && !c.isArchived);
  const completedCourses = courses.filter(c => c.status === 'completed' && !c.isArchived);
  const archivedCourses = courses.filter(c => c.isArchived);

  const totalProgress = courses.length > 0 
    ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / courses.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Archived</p>
                <p className="text-2xl font-bold">{archivedCourses.length}</p>
              </div>
              <Archive className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Progress</p>
                <p className="text-2xl font-bold">{totalProgress}%</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search your courses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lastAccessed">Last Accessed</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="enrollmentDate">Enrollment Date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Course Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeCourses.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCourses.map(course => (
                <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {course.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className={getStatusColor(course.status)}>
                          {course.status}
                        </Badge>
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span className="text-muted-foreground">
                          {course.completedModules}/{course.totalModules} modules
                        </span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <div className="text-sm text-muted-foreground">
                        {course.progress}% complete
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>by {course.instructor}</span>
                      </div>
                      {course.lastAccessed && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        onClick={() => onCourseSelect?.(course)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Continue
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewGrades?.(course.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No active courses</h3>
                <p className="text-muted-foreground">
                  You don't have any active courses. Browse the course catalog to find courses to enroll in.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedCourses.map(course => (
                <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {course.description}
                        </CardDescription>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                        <Badge className={getLevelColor(course.level)}>
                          {course.level}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Completion Info */}
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <Trophy className="h-4 w-4" />
                      <span>Course completed successfully!</span>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>by {course.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Completed: {new Date(course.lastAccessed || course.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={() => onCourseSelect?.(course)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Review
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onViewGrades?.(course.id)}
                      >
                        <Trophy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No completed courses</h3>
                <p className="text-muted-foreground">
                  Complete your active courses to see them here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4">
          {archivedCourses.length > 0 ? (
            <div className="space-y-4">
              <Alert>
                <Archive className="h-4 w-4" />
                <AlertDescription>
                  Archived courses are read-only. You can review content but cannot take evaluations or track new progress.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {archivedCourses.map(course => (
                  <Card key={course.id} className="cursor-pointer hover:shadow-md transition-shadow opacity-75">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-2">
                            {course.description}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge variant="secondary">
                            <Archive className="h-3 w-3 mr-1" />
                            Archived
                          </Badge>
                          <Badge className={getLevelColor(course.level)}>
                            {course.level}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Completion Info */}
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4" />
                        <span>Evaluations disabled for archived courses</span>
                      </div>

                      {/* Course Info */}
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>by {course.instructor}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Archived: {new Date(course.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={() => onCourseSelect?.(course)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onViewGrades?.(course.id)}
                        >
                          <Trophy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No archived courses</h3>
                <p className="text-muted-foreground">
                  Courses that are no longer active will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
