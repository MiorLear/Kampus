import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { 
  Search, 
  Filter, 
  Star, 
  Clock, 
  Users, 
  BookOpen,
  Tag,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { RequestEnrollmentDialog } from './RequestEnrollmentDialog';

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
}

interface CourseCatalogProps {
  onCourseSelect?: (course: Course) => void;
  onEnrollmentRequest?: (courseId: string) => void;
  enrolledCourses?: string[]; // IDs de cursos en los que ya está inscrito
}

const mockCourses: Course[] = [
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
    updatedAt: '2024-01-15'
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
    updatedAt: '2024-01-20'
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
    updatedAt: '2024-01-18'
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
    updatedAt: '2024-01-22'
  },
  {
    id: '5',
    title: 'Machine Learning with TensorFlow',
    description: 'Build and deploy machine learning models using TensorFlow and Keras.',
    instructor: 'Dr. Elena Rodriguez',
    instructorId: 'instructor5',
    level: 'advanced',
    tags: ['Machine Learning', 'TensorFlow', 'AI', 'Neural Networks'],
    duration: '12 weeks',
    modules: 24,
    rating: 4.9,
    enrolledStudents: 98,
    maxStudents: 150,
    isPublished: true,
    createdAt: '2024-01-15',
    updatedAt: '2024-01-25'
  }
];

const availableTags = [
  'HTML', 'CSS', 'JavaScript', 'React', 'Python', 'SQL', 'Database',
  'Web Development', 'Frontend', 'Backend', 'Data Science', 'Machine Learning',
  'AI', 'TensorFlow', 'Pandas', 'NumPy', 'Hooks', 'Design'
];

export function CourseCatalog({ onCourseSelect, onEnrollmentRequest, enrolledCourses = [] }: CourseCatalogProps) {
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);

  // Filter and sort courses
  useEffect(() => {
    let filtered = courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
      
      const matchesTags = selectedTags.length === 0 || 
                         selectedTags.some(tag => course.tags.includes(tag));
      
      return matchesSearch && matchesLevel && matchesTags && course.isPublished;
    });

    // Sort courses
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'students':
          return b.enrolledStudents - a.enrolledStudents;
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredCourses(filtered);
  }, [courses, searchTerm, selectedLevel, selectedTags, sortBy]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleEnrollmentRequest = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollmentDialog(true);
  };

  const handleEnrollmentSubmit = async (courseId: string, message?: string) => {
    try {
      // TODO: Implement actual enrollment request API call
      console.log('Enrollment request submitted:', { courseId, message });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowEnrollmentDialog(false);
      setSelectedCourse(null);
      
      // Call parent callback if provided
      onEnrollmentRequest?.(courseId);
      
      // Show success message (you might want to use a toast notification)
      alert('Enrollment request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit enrollment request:', error);
      alert('Failed to submit enrollment request. Please try again.');
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

  const isEnrolled = (courseId: string) => {
    return enrolledCourses.includes(courseId);
  };

  const isCourseFull = (course: Course) => {
    return course.maxStudents ? course.enrolledStudents >= course.maxStudents : false;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses, instructors, or topics..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {showFilters ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="students">Students</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Level Filter */}
                <div className="space-y-3">
                  <h4 className="font-medium">Level</h4>
                  <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags Filter */}
                <div className="space-y-3">
                  <h4 className="font-medium">Tags</h4>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {availableTags.map(tag => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={tag}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={() => handleTagToggle(tag)}
                        />
                        <Label htmlFor={tag} className="text-sm cursor-pointer">
                          {tag}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {courses.length} courses
        </p>
        {(selectedLevel !== 'all' || selectedTags.length > 0) && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setSelectedLevel('all');
              setSelectedTags([]);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map(course => (
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
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                  {isEnrolled(course.id) && (
                    <Badge className="bg-green-100 text-green-800">
                      Enrolled
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instructor */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{course.instructor}</span>
              </div>

              {/* Course Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.modules} modules</span>
                </div>
              </div>

              {/* Enrollment Info */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {course.enrolledStudents} enrolled
                  {course.maxStudents && ` / ${course.maxStudents} max`}
                </span>
                {course.maxStudents && course.enrolledStudents >= course.maxStudents && (
                  <Badge variant="destructive" className="text-xs">
                    Full
                  </Badge>
                )}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {course.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {course.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{course.tags.length - 3} more
                  </Badge>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onCourseSelect?.(course)}
                >
                  View Details
                </Button>
                {isEnrolled(course.id) ? (
                  <Button 
                    size="sm" 
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => onCourseSelect?.(course)}
                  >
                    Continue Course
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    disabled={isCourseFull(course)}
                    onClick={() => handleEnrollmentRequest(course)}
                  >
                    {isCourseFull(course) 
                      ? 'Full' 
                      : 'Request Enrollment'
                    }
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* No Results */}
      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find more courses.
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedLevel('all');
                setSelectedTags([]);
              }}
            >
              Clear all filters
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Enrollment Dialog */}
      {showEnrollmentDialog && selectedCourse && (
        <RequestEnrollmentDialog
          course={selectedCourse}
          isOpen={showEnrollmentDialog}
          onClose={() => {
            setShowEnrollmentDialog(false);
            setSelectedCourse(null);
          }}
          onSubmit={handleEnrollmentSubmit}
        />
      )}
    </div>
  );
}
