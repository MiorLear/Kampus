import React from 'react';
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

interface Course {
  id: string;
  title: string;
  enrolledStudents: number;
  completionRate: number;
  status: string;
}

interface TeacherAnalyticsProps {
  courses: Course[];
}

const mockAnalyticsData = {
  monthlyProgress: [
    { month: 'Jan', completions: 12, enrollments: 25 },
    { month: 'Feb', completions: 19, enrollments: 30 },
    { month: 'Mar', completions: 15, enrollments: 22 },
    { month: 'Apr', completions: 28, enrollments: 35 },
    { month: 'May', completions: 22, enrollments: 28 },
    { month: 'Jun', completions: 31, enrollments: 40 }
  ],
  gradeDistribution: [
    { range: '90-100%', count: 15, color: '#22c55e' },
    { range: '80-89%', count: 22, color: '#3b82f6' },
    { range: '70-79%', count: 18, color: '#f59e0b' },
    { range: '60-69%', count: 8, color: '#ef4444' },
    { range: '<60%', count: 3, color: '#6b7280' }
  ],
  studentEngagement: [
    { week: 'Week 1', activeStudents: 45, assignments: 38 },
    { week: 'Week 2', activeStudents: 42, assignments: 35 },
    { week: 'Week 3', activeStudents: 48, assignments: 40 },
    { week: 'Week 4', activeStudents: 44, assignments: 37 }
  ]
};

export function TeacherAnalytics({ courses }: TeacherAnalyticsProps) {
  const totalStudents = courses.reduce((sum, course) => sum + course.enrolledStudents, 0);
  const avgCompletionRate = courses.length > 0 
    ? courses.reduce((sum, course) => sum + course.completionRate, 0) / courses.length 
    : 0;
  const publishedCourses = courses.filter(c => c.status === 'published').length;

  return (
    <div className="space-y-6">
      <div>
        <h2>Analytics Overview</h2>
        <p className="text-muted-foreground">Insights into your teaching performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
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
                <p className="text-2xl font-bold">{Math.round(avgCompletionRate)}%</p>
                <p className="text-xs text-green-600">+5% from last month</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-bold">{publishedCourses}</p>
                <p className="text-xs text-blue-600">All published</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Study Time</p>
                <p className="text-2xl font-bold">2.5h</p>
                <p className="text-xs text-muted-foreground">Per week</p>
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
            {courses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">{course.title}</h3>
                    <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <span>{course.enrolledStudents} students</span>
                    <span>{course.completionRate}% completion</span>
                  </div>
                </div>
                <div className="w-32">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Progress</span>
                    <span>{course.completionRate}%</span>
                  </div>
                  <Progress value={course.completionRate} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalyticsData.monthlyProgress}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#3b82f6" name="Enrollments" />
                <Bar dataKey="completions" fill="#22c55e" name="Completions" />
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
                  data={mockAnalyticsData.gradeDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {mockAnalyticsData.gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Student Engagement Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockAnalyticsData.studentEngagement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="activeStudents" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Active Students"
                />
                <Line 
                  type="monotone" 
                  dataKey="assignments" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Completed Assignments"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Sarah Wilson', grade: 95, course: 'Web Development' },
                { name: 'Jane Smith', grade: 92, course: 'React Patterns' },
                { name: 'John Doe', grade: 85, course: 'Web Development' },
                { name: 'Mike Johnson', grade: 83, course: 'React Patterns' }
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.course}</p>
                  </div>
                  <Badge variant="default">{student.grade}%</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: 'Quiz completed', student: 'John Doe', time: '2 hours ago' },
                { action: 'Assignment submitted', student: 'Jane Smith', time: '4 hours ago' },
                { action: 'New enrollment', student: 'Mike Johnson', time: '1 day ago' },
                { action: 'Course completed', student: 'Sarah Wilson', time: '2 days ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.student}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}