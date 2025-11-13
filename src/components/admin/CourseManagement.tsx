import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Search, Eye, Trash2, MoreVertical, Users, FileText, Edit, ClipboardList } from 'lucide-react';
import { Course, User } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';
import { formatDate } from '../../utils/firebase-helpers';
import { Progress } from '../ui/progress';
import { CourseAssignmentsDialog } from './CourseAssignmentsDialog';

interface CourseManagementProps {
  courses: Course[];
  users: User[];
  onCourseUpdate?: () => void;
}

export function CourseManagement({ courses, users, onCourseUpdate }: CourseManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
  const [courseStats, setCourseStats] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load stats for all courses - optimized with parallel requests
    const loadStats = async () => {
      if (courses.length === 0) {
        setCourseStats({});
        return;
      }

      const stats: Record<string, any> = {};
      
      // Initialize all stats with defaults
      courses.forEach(course => {
        stats[course.id] = {
          totalStudents: 0,
          averageProgress: 0,
          totalAssignments: 0,
        };
      });

      try {
        // Load all enrollments and assignments in a single call each, then group by course
        const [allEnrollments, allAssignments] = await Promise.all([
          ApiService.getAllEnrollments(),
          ApiService.getAllAssignments()
        ]);

        // Group enrollments and assignments by course_id
        const enrollmentsByCourse: Record<string, any[]> = {};
        const assignmentsByCourse: Record<string, any[]> = {};

        allEnrollments.forEach((enrollment: any) => {
          const courseId = enrollment.course_id;
          if (!enrollmentsByCourse[courseId]) {
            enrollmentsByCourse[courseId] = [];
          }
          enrollmentsByCourse[courseId].push(enrollment);
        });

        allAssignments.forEach((assignment: any) => {
          const courseId = assignment.course_id;
          if (!assignmentsByCourse[courseId]) {
            assignmentsByCourse[courseId] = [];
          }
          assignmentsByCourse[courseId].push(assignment);
        });

        // Process results for each course
        courses.forEach((course) => {
          try {
            const enrollments = enrollmentsByCourse[course.id] || [];
            const assignments = assignmentsByCourse[course.id] || [];
            const totalStudents = enrollments.length;
            const averageProgress = totalStudents > 0
              ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / totalStudents)
              : 0;
            
            stats[course.id] = {
              totalStudents,
              averageProgress,
              totalAssignments: assignments.length,
            };
          } catch (error) {
            console.error(`Error processing stats for course ${course.id}:`, error);
          }
        });
      } catch (error) {
        console.error('Error loading course stats:', error);
      }
      
      setCourseStats(stats);
    };
    loadStats();
  }, [courses]);

  const filteredCourses = courses.filter(course => {
    if (!course || !course.title) return false;
    const titleMatch = (course.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = course.description ? (course.description || '').toLowerCase().includes(searchQuery.toLowerCase()) : false;
    return titleMatch || descMatch;
  });

  const handleViewDetails = async (course: Course) => {
    setSelectedCourse(course);
    setShowDetailsDialog(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setEditTitle(course.title || '');
    setEditDescription(course.description || '');
    setShowEditDialog(true);
  };

  const handleUpdateCourse = async () => {
    if (!selectedCourse || !editTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    setIsUpdating(true);
    try {
      await ApiService.updateCourse(selectedCourse.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      toast.success('Course updated successfully');
      setShowEditDialog(false);
      setSelectedCourse(null);
      // Refresh courses list reactively - stays on same route
      if (onCourseUpdate) {
        onCourseUpdate();
      }
    } catch (error) {
      toast.error('Failed to update course');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await ApiService.deleteCourse(selectedCourse.id);
      toast.success('Course deleted successfully');
      setShowDeleteDialog(false);
      setSelectedCourse(null);
      // Refresh courses list reactively
      if (onCourseUpdate) {
        onCourseUpdate();
      }
    } catch (error) {
      toast.error('Failed to delete course');
      console.error(error);
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = users.find(u => u.id === teacherId);
    return teacher?.name || 'Unknown';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              Manage all courses on the platform
            </CardDescription>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              className="pl-10 w-full md:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Course</TableHead>
                <TableHead className="hidden sm:table-cell">Teacher</TableHead>
                <TableHead className="hidden md:table-cell">Students</TableHead>
                <TableHead className="hidden lg:table-cell">
                  <div className="flex flex-col">
                    <span>Avg Progress</span>
                    <span className="text-xs font-normal text-muted-foreground">All students</span>
                  </div>
                </TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => {
                  const stats = courseStats[course.id];
                  return (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                            {course.description && course.description.length > 60 
                              ? `${course.description.substring(0, 60)}...` 
                              : course.description}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 sm:hidden">
                            {getTeacherName(course.teacher_id)} • {stats?.totalStudents || 0} students
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{getTeacherName(course.teacher_id)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {stats?.totalStudents || 0}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="w-24">
                          <Progress value={stats?.averageProgress || 0} />
                          <span className="text-xs text-muted-foreground mt-1 block">
                            {stats?.averageProgress || 0}% avg
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{formatDate(course.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(course)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditCourse(course)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedCourse(course);
                                setShowDeleteDialog(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </CardContent>

      {/* Course Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>Course details and statistics</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedCourse.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1">Teacher</h4>
                  <p className="text-sm text-muted-foreground">
                    {getTeacherName(selectedCourse.teacher_id)}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedCourse.created_at)}
                  </p>
                </div>
              </div>

              {courseStats[selectedCourse.id] && (
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Students</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">
                        {courseStats[selectedCourse.id].totalStudents || 0}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">
                        {Math.round(courseStats[selectedCourse.id].averageProgress || 0)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Assignments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">
                        {courseStats[selectedCourse.id].totalAssignments || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button 
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setShowAssignmentsDialog(true);
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Manage Assignments
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Course Assignments Dialog */}
      <CourseAssignmentsDialog
        open={showAssignmentsDialog}
        onOpenChange={setShowAssignmentsDialog}
        course={selectedCourse}
        users={users}
      />

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
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
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Course title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Course description"
                rows={5}
              />
            </div>
            {selectedCourse && (
              <div className="text-sm text-muted-foreground">
                <p>Teacher: {getTeacherName(selectedCourse.teacher_id)}</p>
                <p>Created: {formatDate(selectedCourse.created_at)}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEditDialog(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateCourse}
              disabled={isUpdating || !editTitle.trim()}
            >
              {isUpdating ? 'Updating...' : 'Update Course'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the course "{selectedCourse?.title}" and all associated data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCourse} className="bg-destructive text-destructive-foreground">
              Delete Course
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
