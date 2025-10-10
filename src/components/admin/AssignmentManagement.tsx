import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
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
  DialogFooter,
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
import { Search, Eye, Trash2, MoreVertical, FileText, Users, Calendar, Edit, Plus } from 'lucide-react';
import { Assignment, Course, User } from '../../services/firestore.service';
import { FirestoreService } from '../../services/firestore.service';
import { toast } from 'sonner';
import { formatDate } from '../../utils/firebase-helpers';
import { AssignmentEditor } from './AssignmentEditor';

interface AssignmentManagementProps {
  courses: Course[];
  users: User[];
}

export function AssignmentManagement({ courses, users }: AssignmentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    loadAssignments();
  }, [courses]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const allAssignments: Assignment[] = [];
      
      for (const course of courses) {
        const courseAssignments = await FirestoreService.getAssignmentsByCourse(course.id);
        allAssignments.push(...courseAssignments);
      }
      
      setAssignments(allAssignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const course = courses.find(c => c.id === assignment.course_id);
    const teacher = users.find(u => u.id === course?.teacher_id);
    
    const matchesSearch = (assignment.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (assignment.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (course?.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (teacher?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || assignment.course_id === courseFilter;
    
    return matchesSearch && matchesCourse;
  });

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const getTeacherName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    const teacher = users.find(u => u.id === course?.teacher_id);
    return teacher?.name || 'Unknown Teacher';
  };

  const handleViewDetails = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsDialog(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowEditorDialog(true);
  };

  const handleCreateAssignment = () => {
    setEditingAssignment(null);
    setShowEditorDialog(true);
  };

  const handleDeleteAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await FirestoreService.deleteAssignment(selectedAssignment.id);
      toast.success('Assignment deleted successfully');
      setShowDeleteDialog(false);
      loadAssignments();
    } catch (error) {
      toast.error('Failed to delete assignment');
      console.error(error);
    }
  };

  const handleEditorSave = () => {
    loadAssignments();
    setShowEditorDialog(false);
    setEditingAssignment(null);
  };

  const getStatusBadge = (dueDate?: string) => {
    if (!dueDate) return <Badge variant="secondary">No Due Date</Badge>;
    
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <Badge variant="destructive">Overdue</Badge>;
    if (diffDays <= 3) return <Badge variant="destructive">Due Soon</Badge>;
    if (diffDays <= 7) return <Badge variant="default">Due This Week</Badge>;
    return <Badge variant="secondary">Upcoming</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Assignment Management</CardTitle>
            <CardDescription>
              Monitor and manage all assignments across courses
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={handleCreateAssignment} className="sm:mr-2">
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assignments..."
                className="pl-10 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading assignments...
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Assignment</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No assignments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{assignment.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {assignment.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getCourseName(assignment.course_id)}</TableCell>
                        <TableCell>{getTeacherName(assignment.course_id)}</TableCell>
                        <TableCell>
                          {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                        </TableCell>
                        <TableCell>{getStatusBadge(assignment.due_date)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewDetails(assignment)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditAssignment(assignment)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Assignment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedAssignment(assignment);
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
          </>
        )}
      </CardContent>

      {/* Assignment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>Assignment details and statistics</DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedAssignment.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1">Course</h4>
                  <p className="text-sm text-muted-foreground">
                    {getCourseName(selectedAssignment.course_id)}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1">Teacher</h4>
                  <p className="text-sm text-muted-foreground">
                    {getTeacherName(selectedAssignment.course_id)}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1">Due Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAssignment.due_date ? formatDate(selectedAssignment.due_date) : 'No due date'}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1">Created</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedAssignment.created_at)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assignment "{selectedAssignment?.title}" and all associated submissions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAssignment} className="bg-destructive text-destructive-foreground">
              Delete Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Assignment Editor Dialog */}
      <AssignmentEditor
        open={showEditorDialog}
        onOpenChange={setShowEditorDialog}
        assignment={editingAssignment}
        courses={courses}
        onSave={handleEditorSave}
      />
    </Card>
  );
}
