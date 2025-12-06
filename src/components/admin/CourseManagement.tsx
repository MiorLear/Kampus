import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
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
import { Search, Eye, Trash2, MoreVertical, Users, FileText, Edit, ClipboardList, Plus, Loader2 } from 'lucide-react';
import { Course, User } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';
import { formatDate } from '../../utils/firebase-helpers';
import { Progress } from '../ui/progress';
import { CourseAssignmentsDialog } from './CourseAssignmentsDialog';
import { CourseModulesDialog } from './CourseModulesDialog';
import { CoverImageUpload } from './CoverImageUpload';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';

interface CourseManagementProps {
  courses: Course[];
  users: User[];
  onCourseUpdate?: () => void;
}

export function CourseManagement({ courses, users, onCourseUpdate }: CourseManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCoverImage, setEditCoverImage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false);
  const [showModulesDialog, setShowModulesDialog] = useState(false);
  const [courseStats, setCourseStats] = useState<Record<string, any>>({});
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDescription, setNewCourseDescription] = useState('');
  const [newCourseTeacherId, setNewCourseTeacherId] = useState('');
  const [newCourseCoverImage, setNewCourseCoverImage] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredCourses = courses.filter(course => {
    if (!course || !course.title) return false;
    const titleMatch = (course.title || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    const descMatch = course.description ? (course.description || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) : false;
    return titleMatch || descMatch;
  });

  // Pagination
  const {
    paginatedItems: paginatedCourses,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage: setPagItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredCourses, { itemsPerPage });

  // Reset to page 1 when search filter changes
  useEffect(() => {
    goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery]);

  const handleViewDetails = async (course: Course) => {
    setSelectedCourse(course);
    setShowDetailsDialog(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setEditTitle(course.title || '');
    setEditDescription(course.description || '');
    setEditCoverImage(course.cover_image_url || null);
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
        cover_image_url: editCoverImage || undefined,
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

    // Guardar datos del curso para undo
    const courseToDelete = { ...selectedCourse };

    try {
      await ApiService.deleteCourse(selectedCourse.id);
      
      // Toast con opción de undo
      toast.success('Course deleted successfully', {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              // Restaurar curso (esto requiere un endpoint de restore o recrear)
              toast.info('Undo functionality requires backend restore endpoint');
              // TODO: Implementar restore cuando el backend lo soporte
              // await ApiService.restoreCourse(courseToDelete);
              // if (onCourseUpdate) {
              //   onCourseUpdate();
              // }
            } catch (error) {
              toast.error('Failed to restore course');
              console.error(error);
            }
          }
        },
        duration: 5000,
      });
      
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

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!newCourseTeacherId) {
      toast.error('Please select a teacher');
      return;
    }

    setIsCreating(true);
    try {
      await ApiService.createCourse({
        title: newCourseTitle.trim(),
        description: newCourseDescription.trim(),
        teacher_id: newCourseTeacherId,
        cover_image_url: newCourseCoverImage || undefined,
      });
      toast.success('Course created successfully');
      setShowCreateDialog(false);
      setNewCourseTitle('');
      setNewCourseDescription('');
      setNewCourseTeacherId('');
      setNewCourseCoverImage(null);
      // Refresh courses list
      if (onCourseUpdate) {
        onCourseUpdate();
      }
    } catch (error) {
      toast.error('Failed to create course');
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const teachers = users.filter(u => u.role === 'teacher' || u.role === 'admin');

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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                className="pl-10 w-full md:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              variant="default"
              className="shadow-lg hover:shadow-xl transition-all duration-200"
              style={{ 
                background: 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #4338ca)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #4f46e5)';
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
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
              {paginatedCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.map((course) => {
                  const stats = courseStats[course.id];
                  return (
                    <TableRow key={course.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {course.cover_image_url && (
                            <div className="hidden sm:block w-16 h-16 rounded-md overflow-hidden border border-border flex-shrink-0">
                              <img
                                src={course.cover_image_url}
                                alt={course.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
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
                          <Button variant="ghost" size="sm" aria-label={`Actions for ${course.title}`}>
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

        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} courses
          </div>
          
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  const newItemsPerPage = parseInt(value, 10);
                  setItemsPerPage(newItemsPerPage);
                  setPagItemsPerPage(newItemsPerPage);
                }}
              >
                <SelectTrigger className="w-[100px] h-9" aria-label="Items per page">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={prevPage}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => goToPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={nextPage}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </CardContent>

      {/* Course Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-h-[90vh] w-[70vw] overflow-y-auto" style={{ maxWidth: '70vw' }}>
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>Course details and statistics</DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-4">
              {selectedCourse.cover_image_url && (
                <div className="w-full h-48 rounded-lg overflow-hidden border border-border">
                  <img
                    src={selectedCourse.cover_image_url}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
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

              <div className="pt-4 border-t space-y-2">
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
                <Button 
                  onClick={() => {
                    setShowDetailsDialog(false);
                    setShowModulesDialog(true);
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Modules
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

      {/* Course Modules Dialog */}
      <CourseModulesDialog
        open={showModulesDialog}
        onOpenChange={setShowModulesDialog}
        course={selectedCourse}
      />

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
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
            <CoverImageUpload
              currentImageUrl={editCoverImage || undefined}
              onImageChange={setEditCoverImage}
              courseTitle={editTitle}
            />
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

      {/* Create Course Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to the platform. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-course-title">Course Title *</Label>
              <Input
                id="new-course-title"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="e.g., Introduction to Computer Science"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-course-description">Description</Label>
              <Textarea
                id="new-course-description"
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                placeholder="Describe what students will learn in this course..."
                rows={5}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-course-teacher">Teacher *</Label>
              <Select value={newCourseTeacherId} onValueChange={setNewCourseTeacherId}>
                <SelectTrigger id="new-course-teacher" className="w-full">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No teachers available. Please create a teacher account first.
                    </div>
                  ) : (
                    teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name} ({teacher.email})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {teachers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  You need at least one teacher or admin user to create a course.
                </p>
              )}
            </div>
            <CoverImageUpload
              currentImageUrl={newCourseCoverImage || undefined}
              onImageChange={setNewCourseCoverImage}
              courseTitle={newCourseTitle}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setNewCourseTitle('');
                setNewCourseDescription('');
                setNewCourseTeacherId('');
                setNewCourseCoverImage(null);
              }}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourse}
              disabled={isCreating || !newCourseTitle.trim() || !newCourseTeacherId}
              variant="default"
              className="transition-all duration-200"
              style={{ 
                background: isCreating || !newCourseTitle.trim() || !newCourseTeacherId 
                  ? '#9ca3af' 
                  : 'linear-gradient(to right, #2563eb, #4f46e5)',
                color: 'white',
                border: 'none',
                cursor: isCreating || !newCourseTitle.trim() || !newCourseTeacherId ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!isCreating && newCourseTitle.trim() && newCourseTeacherId) {
                  e.currentTarget.style.background = 'linear-gradient(to right, #1d4ed8, #4338ca)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isCreating && newCourseTitle.trim() && newCourseTeacherId) {
                  e.currentTarget.style.background = 'linear-gradient(to right, #2563eb, #4f46e5)';
                }
              }}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
