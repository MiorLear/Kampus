import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, Users, Award, Clock } from 'lucide-react';
import { formatDate } from '../../utils/firebase-helpers';

interface Course {
  id: string;
  title: string;
  description?: string;
  status?: string;
  created_at?: any;
}

interface TeacherAnalyticsProps {
  courses: Course[];
  enrollments: any[];
  assignments: any[];
  submissions: any[];
}

export function TeacherAnalytics({ courses, enrollments, assignments, submissions }: TeacherAnalyticsProps) {
  // Calculate stats
  const stats = useMemo(() => {
    // Total Students (Unique)
    const uniqueStudents = new Set(enrollments.map(e => e.student_id)).size;
    
    // Enrollments by course
    const enrollmentsByCourse = courses.map(course => {
      const courseEnrollments = enrollments.filter(e => e.course_id === course.id);
      const courseAssignments = assignments.filter(a => a.course_id === course.id);
      const assignmentIds = new Set(courseAssignments.map(a => a.id));
      const courseSubmissions = submissions.filter(s => assignmentIds.has(s.assignment_id));
      
      // Calculate completion (avg progress of enrollments)
      const avgProgress = courseEnrollments.length > 0
        ? courseEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / courseEnrollments.length
        : 0;

      return {
        ...course,
        enrolledStudents: courseEnrollments.length,
        completionRate: Math.round(avgProgress),
        submissionCount: courseSubmissions.length
      };
    });

    const avgCompletion = enrollmentsByCourse.length > 0
      ? enrollmentsByCourse.reduce((acc, c) => acc + c.completionRate, 0) / enrollmentsByCourse.length
      : 0;

    // Monthly Progress (Enrollments creation date) - Mock simulation based on dates if available
    // Since we don't have 'created_at' in enrollments typings shown reliably, we might default or try to parse
    // For now let's group by month if created_at exists, else distribute roughly
    // Actual implementation: Group enrollments by month
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap = new Map<string, { enrollments: number, submissions: number }>();
    
    enrollments.forEach(e => {
      if (e.enrolled_at) {
        const d = new Date(e.enrolled_at);  // Assuming enrolled_at exists
        const key = months[d.getMonth()];
        const current = monthlyDataMap.get(key) || { enrollments: 0, submissions: 0 };
        current.enrollments++;
        monthlyDataMap.set(key, current);
      }
    });

    submissions.forEach(s => {
      if (s.submitted_at) {
        const d = new Date(s.submitted_at);
        const key = months[d.getMonth()];
        const current = monthlyDataMap.get(key) || { enrollments: 0, submissions: 0 };
        current.submissions++;
        monthlyDataMap.set(key, current);
      }
    });

    // If no date data, show empty or minimal
    const monthlyProgress = months.map(m => ({
      month: m,
      enrollments: monthlyDataMap.get(m)?.enrollments || 0,
      completions: monthlyDataMap.get(m)?.submissions || 0 // Proxy completions with submissions for now
    })).filter(d => d.enrollments > 0 || d.completions > 0);

    // Grade Distribution
    const grades = submissions
      .filter(s => s.grade !== undefined && s.grade !== null)
      .map(s => Number(s.grade));
    
    const gradeDistribution = [
      { range: '90-100%', count: grades.filter(g => g >= 90).length, color: '#22c55e' },
      { range: '80-89%', count: grades.filter(g => g >= 80 && g < 90).length, color: '#3b82f6' },
      { range: '70-79%', count: grades.filter(g => g >= 70 && g < 80).length, color: '#f59e0b' },
      { range: '<70%', count: grades.filter(g => g < 70).length, color: '#ef4444' }
    ].filter(d => d.count > 0);

    return {
      totalStudents: uniqueStudents,
      avgCompletion,
      enrollmentsByCourse,
      monthlyProgress: monthlyProgress.length ? monthlyProgress : [{ month: 'No Data', enrollments: 0, completions: 0 }],
      gradeDistribution: gradeDistribution.length ? gradeDistribution : [{ range: 'No Grades', count: 1, color: '#e5e7eb' }]
    };
  }, [courses, enrollments, assignments, submissions]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{stats.totalStudents}</p>
                <p className="text-xs text-muted-foreground">Unique students</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgCompletion)}%</p>
                <p className="text-xs text-muted-foreground">Across all courses</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{courses.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Assignments</p>
                <p className="text-2xl font-bold">{assignments.length}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Course Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.enrollmentsByCourse.map(course => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{course.title}</h3>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{course.enrolledStudents} students</span>
                    <span>{course.submissionCount} submissions</span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Avg Progress</span>
                    <span>{course.completionRate}%</span>
                  </div>
                  <Progress value={course.completionRate} />
                </div>
              </div>
            ))}
            {stats.enrollmentsByCourse.length === 0 && (
              <p className="text-center text-muted-foreground py-4">No courses available.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Enrollments/Activity Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#3b82f6" name="New Enrollments" />
                <Bar dataKey="completions" fill="#22c55e" name="Submissions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {stats.gradeDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
