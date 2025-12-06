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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
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
import { Search, TrendingUp, UserX } from 'lucide-react';
import { Course, User, Enrollment } from '../../services/firestore.service';
import { ApiService } from '../../services/api.service';
import { formatDate } from '../../utils/firebase-helpers';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';
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

interface EnrollmentManagementProps {
  courses: Course[];
  users: User[];
}

export function EnrollmentManagement({ courses, users }: EnrollmentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnenrollDialog, setShowUnenrollDialog] = useState(false);
  const [enrollmentToUnenroll, setEnrollmentToUnenroll] = useState<Enrollment | null>(null);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      // Use getAllEnrollments to get all enrollments in a single call
      const allEnrollments = await ApiService.getAllEnrollments();
      setEnrollments(allEnrollments || []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      toast.error('Failed to load enrollments');
      setEnrollments([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filteredEnrollments = enrollments.filter(enrollment => {
    const student = users.find(u => u.id === enrollment.student_id);
    const course = courses.find(c => c.id === enrollment.course_id);
    
    const matchesSearch = (student?.name || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         (student?.email || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                         (course?.title || '').toLowerCase().includes(debouncedSearchQuery.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || enrollment.course_id === courseFilter;
    
    return matchesSearch && matchesCourse;
  });

  // Pagination
  const {
    paginatedItems: paginatedEnrollments,
    currentPage,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    setItemsPerPage: setPagItemsPerPage,
    startIndex,
    endIndex,
    totalItems,
  } = usePagination(filteredEnrollments, { itemsPerPage });

  // Reset to page 1 when filters change
  useEffect(() => {
    goToPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, courseFilter]);

  const getStudentName = (studentId: string) => {
    const student = users.find(u => u.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const handleUnenroll = (enrollment: Enrollment) => {
    setEnrollmentToUnenroll(enrollment);
    setShowUnenrollDialog(true);
  };

  const confirmUnenroll = async () => {
    if (!enrollmentToUnenroll) return;

    // Guardar datos para undo
    const enrollmentToRestore = { ...enrollmentToUnenroll };

    try {
      await ApiService.unenrollStudent(enrollmentToUnenroll.id);
      
      // Toast con opción de undo
      toast.success('Student unenrolled successfully', {
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              // Re-enroll al estudiante
              await ApiService.enrollStudent({
                student_id: enrollmentToRestore.student_id,
                course_id: enrollmentToRestore.course_id,
                progress: enrollmentToRestore.progress,
              });
              toast.success('Enrollment restored');
              loadEnrollments();
            } catch (error) {
              toast.error('Failed to restore enrollment');
              console.error(error);
            }
          }
        },
        duration: 5000,
      });
      
      setShowUnenrollDialog(false);
      setEnrollmentToUnenroll(null);
      loadEnrollments();
    } catch (error) {
      toast.error('Failed to unenroll student');
      console.error(error);
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'text-green-600';
    if (progress >= 50) return 'text-blue-600';
    if (progress >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Enrollment Management</CardTitle>
            <CardDescription>
              Monitor and manage student enrollments
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search enrollments..."
                className="pl-10 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                    <TableHead className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-2 w-24" />
                          <Skeleton className="h-4 w-12" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto rounded" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Enrolled</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEnrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No enrollments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell className="font-medium">
                          {getStudentName(enrollment.student_id)}
                        </TableCell>
                        <TableCell>{getCourseName(enrollment.course_id)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={enrollment.progress} className="w-24" />
                            <span className={`text-sm ${getProgressColor(enrollment.progress)}`}>
                              {enrollment.progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(enrollment.enrolled_at)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnenroll(enrollment)}
                            aria-label={`Unenroll ${getStudentName(enrollment.student_id)} from ${getCourseName(enrollment.course_id)}`}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} enrollments
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
            
            <div className="flex items-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-muted-foreground">75%+ Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">50-74%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-muted-foreground">25-49%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">{'<'}25%</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Unenroll Confirmation Dialog */}
      <AlertDialog open={showUnenrollDialog} onOpenChange={setShowUnenrollDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will unenroll {enrollmentToUnenroll && getStudentName(enrollmentToUnenroll.student_id)} 
              from {enrollmentToUnenroll && getCourseName(enrollmentToUnenroll.course_id)}. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setEnrollmentToUnenroll(null);
              setShowUnenrollDialog(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmUnenroll}
              className="bg-destructive text-destructive-foreground"
            >
              Unenroll Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
