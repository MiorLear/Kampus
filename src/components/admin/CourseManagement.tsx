import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Filter, 
  MoreVertical,
  Eye,
  Edit,
  Archive,
  Trash2,
  CheckCircle,
  XCircle,
  Users,
  Clock
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface Course {
  id: string;
  title: string;
  instructor: string;
  status: 'draft' | 'published' | 'archived' | 'pending_review';
  enrolledStudents: number;
  createdDate: string;
  lastUpdated: string;
  category: string;
  completionRate: number;
  rating: number;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    instructor: 'Dr. Sarah Martinez',
    status: 'published',
    enrolledStudents: 24,
    createdDate: '2024-01-01',
    lastUpdated: '2024-01-10',
    category: 'Web Development',
    completionRate: 78,
    rating: 4.8
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    instructor: 'Prof. Miguel Rodriguez',
    status: 'published',
    enrolledStudents: 18,
    createdDate: '2024-01-15',
    lastUpdated: '2024-01-20',
    category: 'Frontend',
    completionRate: 65,
    rating: 4.9
  },
  {
    id: '3',
    title: 'Node.js Backend Development',
    instructor: 'Dr. Ana Garcia',
    status: 'pending_review',
    enrolledStudents: 0,
    createdDate: '2024-02-01',
    lastUpdated: '2024-02-05',
    category: 'Backend',
    completionRate: 0,
    rating: 0
  },
  {
    id: '4',
    title: 'Database Design Fundamentals',
    instructor: 'Prof. Carlos Lopez',
    status: 'draft',
    enrolledStudents: 0,
    createdDate: '2024-01-25',
    lastUpdated: '2024-01-30',
    category: 'Database',
    completionRate: 0,
    rating: 0
  },
  {
    id: '5',
    title: 'Python for Data Science',
    instructor: 'Dr. Maria Fernandez',
    status: 'archived',
    enrolledStudents: 156,
    createdDate: '2023-09-01',
    lastUpdated: '2023-12-15',
    category: 'Data Science',
    completionRate: 92,
    rating: 4.7
  }
];

export function CourseManagement() {
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || course.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const updateCourseStatus = (courseId: string, newStatus: 'draft' | 'published' | 'archived' | 'pending_review') => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, status: newStatus, lastUpdated: new Date().toISOString().split('T')[0] } : course
    ));
  };

  const deleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'pending_review':
        return 'outline';
      case 'archived':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-600';
      case 'draft':
        return 'text-gray-600';
      case 'pending_review':
        return 'text-orange-600';
      case 'archived':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.status === 'published').length;
  const pendingCourses = courses.filter(c => c.status === 'pending_review').length;
  const archivedCourses = courses.filter(c => c.status === 'archived').length;

  const categories = [...new Set(courses.map(c => c.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Course Management</h2>
          <p className="text-muted-foreground">Manage and moderate all courses in the system</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalCourses}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{publishedCourses}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{pendingCourses}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{archivedCourses}</p>
              <p className="text-sm text-muted-foreground">Archived</p>
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
                placeholder="Search courses by title or instructor..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
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

      {/* Courses List */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredCourses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary text-sm">
                      {course.title.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{course.title}</h3>
                      <Badge variant={getStatusBadgeVariant(course.status)}>
                        {course.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{course.category}</Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-1">by {course.instructor}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrolledStudents} students
                      </span>
                      <span>Created: {new Date(course.createdDate).toLocaleDateString()}</span>
                      <span>Updated: {new Date(course.lastUpdated).toLocaleDateString()}</span>
                      {course.rating > 0 && (
                        <span>Rating: {course.rating}/5</span>
                      )}
                      {course.completionRate > 0 && (
                        <span>Completion: {course.completionRate}%</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {course.status === 'pending_review' && (
                    <div className="flex gap-2 mr-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCourseStatus(course.id, 'draft')}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateCourseStatus(course.id, 'published')}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Course
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" />
                        View Students ({course.enrolledStudents})
                      </DropdownMenuItem>
                      
                      {course.status === 'published' && (
                        <DropdownMenuItem onClick={() => updateCourseStatus(course.id, 'archived')}>
                          <Archive className="mr-2 h-4 w-4" />
                          Archive Course
                        </DropdownMenuItem>
                      )}
                      
                      {course.status === 'archived' && (
                        <DropdownMenuItem onClick={() => updateCourseStatus(course.id, 'published')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Restore Course
                        </DropdownMenuItem>
                      )}

                      {course.status === 'draft' && (
                        <DropdownMenuItem onClick={() => updateCourseStatus(course.id, 'pending_review')}>
                          <Clock className="mr-2 h-4 w-4" />
                          Submit for Review
                        </DropdownMenuItem>
                      )}
                      
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteCourse(course.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Course
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No courses found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {pendingCourses > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Course Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {pendingCourses} courses are waiting for your review and approval.
              </p>
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => {
                    courses.filter(c => c.status === 'pending_review').forEach(course => {
                      updateCourseStatus(course.id, 'published');
                    });
                  }}
                >
                  Approve All Pending Courses
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    courses.filter(c => c.status === 'pending_review').forEach(course => {
                      updateCourseStatus(course.id, 'draft');
                    });
                  }}
                >
                  Reject All Pending Courses
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Course Distribution by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(category => {
              const count = courses.filter(c => c.category === category).length;
              const published = courses.filter(c => c.category === category && c.status === 'published').length;
              return (
                <div key={category} className="p-4 border rounded-lg text-center">
                  <h3 className="font-medium mb-2">{category}</h3>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground">{published} published</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}