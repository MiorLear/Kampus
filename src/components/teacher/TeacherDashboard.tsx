import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Plus,
  Edit,
  FileText,
  Clock,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useCourses, useAssignments, useSubmissions, useEnrollments } from '../../hooks/useFirestore';
import { FirestoreService } from '../../services/firestore.service';
import { formatDate, getTimeRemaining } from '../../utils/firebase-helpers';
import { toast } from 'sonner@2.0.3';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
}

interface TeacherDashboardProps {
  user: UserProfile;
}

export function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  
  const { courses, loading: coursesLoading, refreshCourses } = useCourses(user.id);
  
  const [courseEnrollments, setCourseEnrollments] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
  });

  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  useEffect(() => {
    const loadData = async () => {
      if (courses.length > 0) {
        // Get enrollments for all courses
        const enrollmentsPromises = courses.map(c => FirestoreService.getEnrollmentsByCourse(c.id));
        const enrollmentsArrays = await Promise.all(enrollmentsPromises);
        const allEnrollments = enrollmentsArrays.flat();
        setCourseEnrollments(allEnrollments);

        // Get all assignments
        const assignmentsPromises = courses.map(c => FirestoreService.getAssignmentsByCourse(c.id));
        const assignmentsArrays = await Promise.all(assignmentsPromises);
        const assignments = assignmentsArrays.flat();
        setAllAssignments(assignments);

        // Get pending submissions
        const submissionsPromises = assignments.map(a => FirestoreService.getSubmissionsByAssignment(a.id));
        const submissionsArrays = await Promise.all(submissionsPromises);
        const allSubs = submissionsArrays.flat();
        const pending = allSubs.filter(s => s.grade === undefined || s.grade === null);
        setPendingSubmissions(pending);
      }
    };

    loadData();
  }, [courses]);

  const handleCreateCourse = async () => {
    if (!newCourse.title || !newCourse.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await FirestoreService.createCourse({
        title: newCourse.title,
        description: newCourse.description,
        teacher_id: user.id,
      });

      toast.success('Course created successfully!');
      setShowCreateCourse(false);
      setNewCourse({ title: '', description: '' });
      refreshCourses();
    } catch (error) {
      toast.error('Failed to create course');
      console.error(error);
    }
  };

  const handleCreateAssignment = async () => {
    if (!selectedCourse || !newAssignment.title || !newAssignment.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await FirestoreService.createAssignment({
        course_id: selectedCourse,
        title: newAssignment.title,
        description: newAssignment.description,
        due_date: newAssignment.due_date || undefined,
      });

      toast.success('Assignment created successfully!');
      setShowCreateAssignment(false);
      setNewAssignment({ title: '', description: '', due_date: '' });
      setSelectedCourse(null);
      
      // Refresh assignments
      window.location.reload();
    } catch (error) {
      toast.error('Failed to create assignment');
      console.error(error);
    }
  };

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    totalCourses: courses.length,
    totalStudents: courseEnrollments.length,
    totalAssignments: allAssignments.length,
    pendingGrading: pendingSubmissions.length,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Teacher Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses and students</p>
        </div>
        <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Add a new course to your teaching portfolio</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="e.g., Introduction to Web Development"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Describe what students will learn..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateCourse(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCourse}>Create Course</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.totalAssignments}</div>
            <p className="text-xs text-muted-foreground">Created assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pendingGrading}</div>
            <p className="text-xs text-muted-foreground">To grade</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Courses */}
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Your active courses</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No courses yet. Create your first course to get started!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {courses.slice(0, 3).map((course) => {
                      const enrollments = courseEnrollments.filter(e => e.course_id === course.id);
                      return (
                        <div key={course.id} className="p-3 border rounded-lg">
                          <h4>{course.title}</h4>
                          <p className="text-sm text-muted-foreground">{enrollments.length} students enrolled</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Grading */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Grading</CardTitle>
                <CardDescription>Submissions waiting for review</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingSubmissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No pending submissions</p>
                ) : (
                  <div className="space-y-3">
                    {pendingSubmissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Assignment #{submission.assignment_id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Submitted {formatDate(submission.submitted_at)}
                          </p>
                        </div>
                        <Button size="sm">Grade</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>Manage your courses</CardDescription>
            </CardHeader>
            <CardContent>
              {courses.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No courses created yet</p>
                  <Button onClick={() => setShowCreateCourse(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {courses.map((course) => {
                    const enrollments = courseEnrollments.filter(e => e.course_id === course.id);
                    const assignments = allAssignments.filter(a => a.course_id === course.id);
                    
                    return (
                      <div key={course.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4>{course.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {enrollments.length} students • {assignments.length} assignments
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedCourse(course.id);
                                setShowCreateAssignment(true);
                              }}
                            >
                              Add Assignment
                            </Button>
                            <Button size="sm">View</Button>
                          </div>
                        </div>
                        <p className="text-sm">{course.description}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <CardDescription>Manage course assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {allAssignments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No assignments created yet
                </p>
              ) : (
                <div className="space-y-3">
                  {allAssignments.map((assignment) => {
                    const course = courses.find(c => c.id === assignment.course_id);
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">{course?.title}</p>
                          {assignment.due_date && (
                            <p className="text-xs text-muted-foreground">
                              Due: {formatDate(assignment.due_date)}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">Edit</Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Submissions to Grade</CardTitle>
              <CardDescription>Review and grade student work</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingSubmissions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  All caught up! No pending submissions.
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingSubmissions.map((submission) => (
                    <div key={submission.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Assignment #{submission.assignment_id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            Student ID: {submission.student_id.slice(0, 8)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Submitted: {formatDate(submission.submitted_at)}
                          </p>
                        </div>
                        <Button size="sm">Grade Now</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Assignment Dialog */}
      <Dialog open={showCreateAssignment} onOpenChange={setShowCreateAssignment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Assignment</DialogTitle>
            <DialogDescription>Add an assignment to your course</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignment-title">Assignment Title</Label>
              <Input
                id="assignment-title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                placeholder="e.g., Module 1 Quiz"
              />
            </div>
            <div>
              <Label htmlFor="assignment-description">Description</Label>
              <Textarea
                id="assignment-description"
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                placeholder="Describe the assignment..."
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={newAssignment.due_date}
                onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateAssignment(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAssignment}>Create Assignment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
