import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Star, 
  Tag,
  AlertCircle,
  CheckCircle,
  Loader2
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
}

interface RequestEnrollmentDialogProps {
  course: Course;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (courseId: string, message?: string) => Promise<void>;
}

export function RequestEnrollmentDialog({ 
  course, 
  isOpen, 
  onClose, 
  onSubmit 
}: RequestEnrollmentDialogProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(course.id, message.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit enrollment request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMessage('');
      setError(null);
      onClose();
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

  const isCourseFull = course.maxStudents ? course.enrolledStudents >= course.maxStudents : false;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Request Course Enrollment
          </DialogTitle>
          <DialogDescription>
            Submit a request to enroll in this course. The instructor will review your request and respond accordingly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Course Information */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{course.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              </div>
              <Badge className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
            </div>

            {/* Course Details */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Instructor</span>
                </div>
                <p className="text-sm text-muted-foreground">{course.instructor}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Rating</span>
                </div>
                <p className="text-sm text-muted-foreground">{course.rating}/5.0</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Duration</span>
                </div>
                <p className="text-sm text-muted-foreground">{course.duration}</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Modules</span>
                </div>
                <p className="text-sm text-muted-foreground">{course.modules}</p>
              </div>
            </div>

            {/* Enrollment Status */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {course.enrolledStudents} enrolled
                  {course.maxStudents && ` / ${course.maxStudents} max`}
                </span>
              </div>
              {isCourseFull && (
                <Badge variant="destructive" className="text-xs">
                  Course Full
                </Badge>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {course.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Course Full Warning */}
          {isCourseFull && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This course has reached its maximum capacity. Your enrollment request will be added to a waiting list.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Message Input */}
          <div className="space-y-2">
            <Label htmlFor="enrollment-message">
              Message to Instructor (Optional)
            </Label>
            <Textarea
              id="enrollment-message"
              placeholder="Tell the instructor why you're interested in this course, your background, or any questions you have..."
              className="min-h-24"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              disabled={isSubmitting}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>This message will be sent to {course.instructor}</span>
              <span>{message.length}/500</span>
            </div>
          </div>

          {/* Enrollment Information */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">What happens next?</p>
                <ul className="text-sm space-y-1 ml-4">
                  <li>• Your enrollment request will be sent to the instructor</li>
                  <li>• The instructor will review your request and respond</li>
                  <li>• You'll receive a notification when your request is approved or denied</li>
                  <li>• Once approved, you'll have full access to course materials</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        </div>

          {/* Actions */}
          <div className="flex-shrink-0 flex items-center justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || isCourseFull}
              className="min-w-32"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Request Enrollment'
              )}
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );
}
