import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  ArrowLeft, 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Tag, 
  Play, 
  Download,
  ExternalLink,
  CheckCircle,
  Calendar,
  User,
  FileText,
  Video,
  Link,
  AlertCircle
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
  longDescription?: string;
  prerequisites?: string[];
  learningObjectives?: string[];
  syllabus?: CourseModule[];
}

interface CourseModule {
  id: string;
  title: string;
  type: 'video' | 'text' | 'pdf' | 'link' | 'quiz' | 'assignment';
  duration?: string;
  description?: string;
  isPreview?: boolean;
}

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onEnroll?: (courseId: string) => void;
  isEnrolled?: boolean;
  enrollmentStatus?: 'pending' | 'approved' | 'rejected';
}

const mockSyllabus: CourseModule[] = [
  {
    id: '1',
    title: 'Course Introduction and Setup',
    type: 'video',
    duration: '15 min',
    description: 'Welcome to the course and setting up your development environment',
    isPreview: true
  },
  {
    id: '2',
    title: 'HTML Fundamentals',
    type: 'text',
    duration: '20 min',
    description: 'Learn the basics of HTML structure and semantic elements'
  },
  {
    id: '3',
    title: 'CSS Styling Basics',
    type: 'video',
    duration: '25 min',
    description: 'Introduction to CSS selectors, properties, and layout'
  },
  {
    id: '4',
    title: 'HTML & CSS Quiz',
    type: 'quiz',
    duration: '30 min',
    description: 'Test your understanding of HTML and CSS fundamentals'
  },
  {
    id: '5',
    title: 'JavaScript Introduction',
    type: 'video',
    duration: '30 min',
    description: 'Variables, functions, and basic JavaScript concepts'
  },
  {
    id: '6',
    title: 'DOM Manipulation',
    type: 'text',
    duration: '25 min',
    description: 'Learn how to interact with HTML elements using JavaScript'
  },
  {
    id: '7',
    title: 'Project: Interactive Web Page',
    type: 'assignment',
    duration: '2 hours',
    description: 'Build a complete interactive web page using HTML, CSS, and JavaScript'
  }
];

export function CourseDetail({ 
  course, 
  onBack, 
  onEnroll, 
  isEnrolled = false,
  enrollmentStatus 
}: CourseDetailProps) {
  const [showEnrollmentDialog, setShowEnrollmentDialog] = useState(false);
  const [syllabus, setSyllabus] = useState<CourseModule[]>(mockSyllabus);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'text': return <FileText className="h-4 w-4" />;
      case 'pdf': return <Download className="h-4 w-4" />;
      case 'link': return <ExternalLink className="h-4 w-4" />;
      case 'quiz': return <CheckCircle className="h-4 w-4" />;
      case 'assignment': return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getModuleColor = (type: string) => {
    switch (type) {
      case 'video': return 'text-blue-600';
      case 'text': return 'text-green-600';
      case 'pdf': return 'text-red-600';
      case 'link': return 'text-purple-600';
      case 'quiz': return 'text-orange-600';
      case 'assignment': return 'text-indigo-600';
      default: return 'text-gray-600';
    }
  };

  const isCourseFull = course.maxStudents ? course.enrolledStudents >= course.maxStudents : false;
  const canEnroll = !isEnrolled && !isCourseFull && course.isPublished;

  const handleEnrollmentRequest = () => {
    setShowEnrollmentDialog(true);
  };

  const handleEnrollmentSubmit = async (courseId: string, message?: string) => {
    try {
      // TODO: Implement actual enrollment request API call
      console.log('Enrollment request submitted:', { courseId, message });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowEnrollmentDialog(false);
      onEnroll?.(courseId);
      
      // Show success message
      alert('Enrollment request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit enrollment request:', error);
      alert('Failed to submit enrollment request. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-1">by {course.instructor}</p>
            </div>
            <Badge className={getLevelColor(course.level)}>
              {course.level}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {course.longDescription || course.description}
              </p>
              
              {/* Learning Objectives */}
              {course.learningObjectives && course.learningObjectives.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">What You'll Learn</h4>
                  <ul className="space-y-1">
                    {course.learningObjectives.map((objective, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <ul className="space-y-1">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                        <span>{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Course Syllabus */}
          <Card>
            <CardHeader>
              <CardTitle>Course Syllabus</CardTitle>
              <CardDescription>
                {syllabus.length} modules • {course.duration}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {syllabus.map((module, index) => (
                  <div 
                    key={module.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      module.isPreview ? 'bg-blue-50 border-blue-200' : 'bg-muted/30'
                    }`}
                  >
                    <div className={`${getModuleColor(module.type)}`}>
                      {getModuleIcon(module.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">
                          {index + 1}. {module.title}
                        </h4>
                        {module.isPreview && (
                          <Badge variant="secondary" className="text-xs">
                            Preview
                          </Badge>
                        )}
                      </div>
                      {module.description && (
                        <p className="text-xs text-muted-foreground">
                          {module.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {module.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{module.duration}</span>
                        </div>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {module.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Rating</span>
                  </div>
                  <p className="text-lg font-bold">{course.rating}</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Students</span>
                  </div>
                  <p className="text-lg font-bold">{course.enrolledStudents}</p>
                </div>
              </div>

              <Separator />

              {/* Course Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Modules:</span>
                  <span className="font-medium">{course.modules}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="font-medium">
                    {new Date(course.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Enrollment Status */}
              {isEnrolled ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    You are enrolled in this course
                  </AlertDescription>
                </Alert>
              ) : enrollmentStatus === 'pending' ? (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your enrollment request is pending approval
                  </AlertDescription>
                </Alert>
              ) : enrollmentStatus === 'rejected' ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your enrollment request was not approved
                  </AlertDescription>
                </Alert>
              ) : isCourseFull ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This course is currently full
                  </AlertDescription>
                </Alert>
              ) : null}

              {/* Enrollment Button */}
              {canEnroll && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleEnrollmentRequest}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Request Enrollment
                </Button>
              )}

              {isEnrolled && (
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    // Navigate to course content
                    console.log('Navigate to course content');
                  }}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Continue Course
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {course.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Instructor Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{course.instructor}</p>
                  <p className="text-sm text-muted-foreground">Course Instructor</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Enrollment Dialog */}
      {showEnrollmentDialog && (
        <RequestEnrollmentDialog
          course={course}
          isOpen={showEnrollmentDialog}
          onClose={() => setShowEnrollmentDialog(false)}
          onSubmit={handleEnrollmentSubmit}
        />
      )}
    </div>
  );
}
