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
import { Search, Eye, Trash2, MoreVertical, Users, FileText } from 'lucide-react';
import { Course, User } from '../../services/firestore.service';
import { FirestoreService } from '../../services/firestore.service';
import { toast } from 'sonner';
import { formatDate } from '../../utils/firebase-helpers';
import { Progress } from '../ui/progress';

interface CourseManagementProps {
  courses: Course[];
  users: User[];
}

export function CourseManagement({ courses, users }: CourseManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseStats, setCourseStats] = useState<Record<string, any>>({});

  useEffect(() => {
    // Load stats for all courses
    const loadStats = async () => {
      const stats: Record<string, any> = {};
      for (const course of courses) {
        const analytics = await FirestoreService.getCourseAnalytics(course.id);
        stats[course.id] = analytics;
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

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await FirestoreService.deleteCourse(selectedCourse.id);
      toast.success('Course deleted successfully');
      setShowDeleteDialog(false);
      window.location.reload();
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
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
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
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {course.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTeacherName(course.teacher_id)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {stats?.totalStudents || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <Progress value={stats?.averageProgress || 0} />
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(course.created_at)}</TableCell>
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
