import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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
import { Search, Eye, Trash2, MoreVertical, Edit, Plus, FileText } from 'lucide-react';
import { Assignment, Course, User } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { toast } from 'sonner';
import { formatDate } from '../../utils/firebase-helpers';
import { AssignmentEditor } from './AssignmentEditor';

interface CourseAssignmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course | null;
  users: User[];
}

export function CourseAssignmentsDialog({
  open,
  onOpenChange,
  course,
  users,
}: CourseAssignmentsDialogProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditorDialog, setShowEditorDialog] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);

  useEffect(() => {
    if (open && course) {
      loadAssignments();
    }
  }, [open, course]);

  const loadAssignments = async () => {
    if (!course) return;
    
    try {
      setLoading(true);
      const courseAssignments = await ApiService.getAssignmentsByCourse(course.id);
      setAssignments(courseAssignments || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = (assignment.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (assignment.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleViewDetails = (assignment: Assignment) => {
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
      await ApiService.deleteAssignment(selectedAssignment.id);
      toast.success('Assignment deleted successfully');
      setShowDeleteDialog(false);
      setSelectedAssignment(null);
      loadAssignments(); // Refresh reactively
    } catch (error) {
      toast.error('Failed to delete assignment');
      console.error(error);
    }
  };

  const handleEditorSave = () => {
    loadAssignments(); // Refresh reactively
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

  if (!course) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-[95vw] sm:!max-w-6xl max-h-[95vh] overflow-y-auto w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Manage Assignments - {course.title}</DialogTitle>
            <DialogDescription>
              Create, edit, and manage assignments for this course
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assignments..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateAssignment}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading assignments...
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {assignments.length === 0 
                  ? 'No assignments found for this course'
                  : 'No assignments match your search'}
              </div>
            ) : (
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="hidden sm:table-cell">Due Date</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{assignment.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
                              {assignment.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {assignment.due_date ? formatDate(assignment.due_date) : 'No due date'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {getStatusBadge(assignment.due_date)}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {assignment.created_at ? formatDate(assignment.created_at) : '-'}
                        </TableCell>
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
                                Edit
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedAssignment?.title}</DialogTitle>
            <DialogDescription>Assignment details</DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedAssignment.description || 'No description'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="mb-1 font-medium">Due Date</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAssignment.due_date ? formatDate(selectedAssignment.due_date) : 'No due date'}
                  </p>
                </div>
                <div>
                  <h4 className="mb-1 font-medium">Max Points</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAssignment.max_points || 100}
                  </p>
                </div>
              </div>
              {selectedAssignment.instructions && (
                <div>
                  <h4 className="mb-2 font-medium">Instructions</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedAssignment.instructions}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assignment Editor Dialog */}
      <AssignmentEditor
        open={showEditorDialog}
        onOpenChange={setShowEditorDialog}
        assignment={editingAssignment}
        courses={course ? [course] : []}
        onSave={handleEditorSave}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assignment "{selectedAssignment?.title}". This action cannot be undone.
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
    </>
  );
}

