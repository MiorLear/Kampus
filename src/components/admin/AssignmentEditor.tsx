import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Loader2, Calendar } from 'lucide-react';
import { Assignment, Course, CourseModule } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';

interface AssignmentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment?: Assignment | null;
  courses: Course[];
  onSave: () => void;
  dialogClassName?: string;
  dialogStyle?: React.CSSProperties;
}

export function AssignmentEditor({
  open,
  onOpenChange,
  assignment,
  courses,
  onSave,
  dialogClassName,
  dialogStyle,
}: AssignmentEditorProps) {
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course_id: '',
    module_id: '',
    due_date: '',
    max_points: 100,
    instructions: '',
    attachments: [] as string[],
  });

  // Load modules when course is selected
  useEffect(() => {
    const loadModules = async () => {
      if (formData.course_id) {
        setLoadingModules(true);
        try {
          const courseModules = await ApiService.getCourseModules(formData.course_id);
          setModules(courseModules);
          // If editing and module_id is set, keep it; otherwise reset
          if (!assignment || !assignment.module_id) {
            setFormData(prev => ({ ...prev, module_id: '' }));
          }
        } catch (error) {
          console.error('Error loading modules:', error);
          toast.error('Failed to load course modules');
          setModules([]);
        } finally {
          setLoadingModules(false);
        }
      } else {
        setModules([]);
        setFormData(prev => ({ ...prev, module_id: '' }));
      }
    };

    if (open && formData.course_id) {
      loadModules();
    }
  }, [formData.course_id, open]);

  useEffect(() => {
    if (assignment && open) {
      setFormData({
        title: assignment.title || '',
        description: assignment.description || '',
        course_id: assignment.course_id || '',
        module_id: assignment.module_id || '',
        due_date: assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : '',
        max_points: assignment.max_points || 100,
        instructions: assignment.instructions || '',
        attachments: assignment.attachments || [],
      });
    } else if (open) {
      // Reset form for new assignment
      // If only one course, auto-select it
      const defaultCourseId = courses.length === 1 ? courses[0].id : '';
      setFormData({
        title: '',
        description: '',
        course_id: defaultCourseId,
        module_id: '',
        due_date: '',
        max_points: 100,
        instructions: '',
        attachments: [],
      });
    }
  }, [assignment, open, courses]);

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Assignment title is required');
      return;
    }

    if (!formData.course_id) {
      toast.error('Please select a course');
      return;
    }

    if (!formData.module_id) {
      toast.error('Please select a module');
      return;
    }

    setLoading(true);

    try {
      const assignmentData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        course_id: formData.course_id,
        module_id: formData.module_id,
        due_date: formData.due_date ? new Date(formData.due_date).toISOString() : undefined,
        max_points: formData.max_points,
        instructions: formData.instructions.trim(),
        attachments: formData.attachments,
      };

      if (assignment) {
        // Update existing assignment
        await ApiService.updateAssignment(assignment.id, assignmentData);
        toast.success('Assignment updated successfully!');
      } else {
        // Create new assignment
        await ApiService.createAssignment(assignmentData);
        toast.success('Assignment created successfully!');
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving assignment:', error);
      toast.error('Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const isEditing = !!assignment;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={dialogClassName || "sm:max-w-[600px] max-h-[90vh] overflow-y-auto"}
        style={dialogStyle}
      >
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Assignment' : 'Create New Assignment'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update the assignment details below.' 
              : 'Fill in the details to create a new assignment.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Assignment Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter assignment title"
              disabled={loading}
            />
          </div>

          {/* Course Selection - Always show selector */}
          <div className="space-y-2">
            <Label htmlFor="course">
              Course <span className="text-destructive">*</span>
            </Label>
            {courses.length === 0 ? (
              <div className="p-3 border border-amber-200 bg-amber-50 rounded-md">
                <p className="text-sm text-amber-800">
                  No courses available. Please create a course first before creating assignments.
                </p>
              </div>
            ) : (
              <Select
                value={formData.course_id}
                onValueChange={(value) => handleChange('course_id', value)}
                disabled={loading || courses.length === 0}
              >
                <SelectTrigger id="course" className="w-full">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                      {course.description && (
                        <span className="text-xs text-muted-foreground ml-2">
                          - {course.description.substring(0, 50)}{course.description.length > 50 ? '...' : ''}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {courses.length > 0 && !formData.course_id && (
              <p className="text-xs text-amber-600 mt-1">
                Please select a course to associate this assignment with.
              </p>
            )}
          </div>

          {/* Module Selection - Show after course is selected */}
          {formData.course_id && (
            <div className="space-y-2">
              <Label htmlFor="module">
                Module <span className="text-destructive">*</span>
              </Label>
              {loadingModules ? (
                <div className="flex items-center gap-2 p-3 border rounded-md">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading modules...</span>
                </div>
              ) : modules.length === 0 ? (
                <div className="p-3 border border-amber-200 bg-amber-50 rounded-md">
                  <p className="text-sm text-amber-800">
                    No modules available for this course. Please create modules first.
                  </p>
                </div>
              ) : (
                <Select
                  value={formData.module_id}
                  onValueChange={(value) => handleChange('module_id', value)}
                  disabled={loading || loadingModules || modules.length === 0}
                >
                  <SelectTrigger id="module" className="w-full">
                    <SelectValue placeholder="Select a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map((module) => (
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
              {modules.length > 0 && !formData.module_id && (
                <p className="text-xs text-amber-600 mt-1">
                  Please select a module to associate this assignment with.
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe what students need to do..."
              rows={3}
              disabled={loading}
            />
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Provide detailed instructions for students..."
              rows={4}
              disabled={loading}
            />
          </div>

          {/* Due Date and Max Points */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleChange('due_date', e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max_points">Max Points</Label>
              <Input
                id="max_points"
                type="number"
                min="0"
                max="1000"
                value={formData.max_points}
                onChange={(e) => handleChange('max_points', parseInt(e.target.value) || 100)}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading || !formData.title.trim() || !formData.course_id || !formData.module_id}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </>
            ) : (
              isEditing ? 'Update Assignment' : 'Create Assignment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
