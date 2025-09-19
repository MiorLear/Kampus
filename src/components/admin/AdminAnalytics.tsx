import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Calendar, Target } from 'lucide-react';

const mockAnalyticsData = {
  userGrowth: [
    { month: 'Jan', students: 45, teachers: 8, admins: 3, total: 56 },
    { month: 'Feb', students: 62, teachers: 12, admins: 3, total: 77 },
    { month: 'Mar', students: 89, teachers: 15, admins: 4, total: 108 },
    { month: 'Apr', students: 124, teachers: 18, admins: 4, total: 146 },
    { month: 'May', students: 167, teachers: 22, admins: 5, total: 194 },
    { month: 'Jun', students: 203, teachers: 26, admins: 5, total: 234 }
  ],
  
  coursePerformance: [
    { name: 'Web Development', enrollments: 45, completions: 38, rating: 4.8 },
    { name: 'React Patterns', enrollments: 32, completions: 28, rating: 4.9 },
    { name: 'Data Science', enrollments: 28, completions: 25, rating: 4.7 },
    { name: 'Database Design', enrollments: 22, completions: 18, rating: 4.6 },
    { name: 'Node.js Backend', enrollments: 18, completions: 14, rating: 4.5 }
  ],
  
  enrollmentTrends: [
    { week: 'Week 1', enrollments: 12, approvals: 10, rejections: 2 },
    { week: 'Week 2', enrollments: 18, approvals: 15, rejections: 3 },
    { week: 'Week 3', enrollments: 24, approvals: 20, rejections: 4 },
    { week: 'Week 4', enrollments: 15, approvals: 13, rejections: 2 },
    { week: 'Week 5', enrollments: 21, approvals: 18, rejections: 3 },
    { week: 'Week 6', enrollments: 19, approvals: 16, rejections: 3 }
  ],
  
  completionRates: [
    { range: '90-100%', count: 45, color: '#22c55e' },
    { range: '80-89%', count: 67, color: '#3b82f6' },
    { range: '70-79%', count: 38, color: '#f59e0b' },
    { range: '60-69%', count: 22, color: '#ef4444' },
    { range: '<60%', count: 15, color: '#6b7280' }
  ],
  
  platformUsage: [
    { day: 'Mon', activeUsers: 156, newLogins: 23, courseViews: 234 },
    { day: 'Tue', activeUsers: 178, newLogins: 31, courseViews: 267 },
    { day: 'Wed', activeUsers: 192, newLogins: 28, courseViews: 298 },
    { day: 'Thu', activeUsers: 165, newLogins: 25, courseViews: 245 },
    { day: 'Fri', activeUsers: 143, newLogins: 19, courseViews: 201 },
    { day: 'Sat', activeUsers: 98, newLogins: 15, courseViews: 134 },
    { day: 'Sun', activeUsers: 87, newLogins: 12, courseViews: 112 }
  ]
};

export function AdminAnalytics() {
  const totalUsers = 1247;
  const totalCourses = 45;
  const totalEnrollments = 2890;
  const avgCompletionRate = 78;
  const monthlyGrowth = 12.5;
  const userSatisfaction = 4.7;

  return (
    <div className="space-y-6">
      <div>
        <h2>Analytics Dashboard</h2>
        <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{totalUsers}</p>
                <p className="text-xs text-green-600">+{monthlyGrowth}% this month</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-xl font-bold">{totalCourses}</p>
                <p className="text-xs text-green-600">+3 this week</p>
              </div>
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Enrollments</p>
                <p className="text-xl font-bold">{totalEnrollments}</p>
                <p className="text-xs text-green-600">+156 this week</p>
              </div>
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-xl font-bold">{avgCompletionRate}%</p>
                <p className="text-xs text-green-600">+2% this month</p>
              </div>
              <Target className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfaction</p>
                <p className="text-xl font-bold">{userSatisfaction}/5</p>
                <p className="text-xs text-green-600">+0.2 this month</p>
              </div>
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-xl font-bold">456</p>
                <p className="text-xs text-blue-600">Real-time</p>
              </div>
              <Calendar className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth and Platform Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Growth Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} children={
              <AreaChart data={mockAnalyticsData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="students" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="teachers" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                <Area type="monotone" dataKey="admins" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
              </AreaChart>
            } />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Daily Platform Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} children={
              <LineChart data={mockAnalyticsData.platformUsage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="activeUsers" stroke="#3b82f6" strokeWidth={2} name="Active Users" />
                <Line type="monotone" dataKey="courseViews" stroke="#22c55e" strokeWidth={2} name="Course Views" />
              </LineChart>
            } />
          </CardContent>
        </Card>
      </div>

      {/* Course Performance and Completion Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} children={
              <BarChart data={mockAnalyticsData.coursePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#3b82f6" name="Enrollments" />
                <Bar dataKey="completions" fill="#22c55e" name="Completions" />
              </BarChart>
            } />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completion Rate Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300} children={
              <PieChart>
                <Pie
                  data={mockAnalyticsData.completionRates}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ range, count }) => `${range}: ${count}`}
                >
                  {mockAnalyticsData.completionRates.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            } />
          </CardContent>
        </Card>
      </div>

      {/* Enrollment Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300} children={
            <BarChart data={mockAnalyticsData.enrollmentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="enrollments" fill="#3b82f6" name="New Enrollments" />
              <Bar dataKey="approvals" fill="#22c55e" name="Approvals" />
              <Bar dataKey="rejections" fill="#ef4444" name="Rejections" />
            </BarChart>
          } />
        </CardContent>
      </Card>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockAnalyticsData.coursePerformance.slice(0, 5).map((course, index) => (
                <div key={course.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm">{course.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{course.completions}/{course.enrollments}</span>
                    <span className="text-sm font-medium">{Math.round((course.completions / course.enrollments) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Engagement Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Daily Active Users</span>
                <span className="font-medium">456</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Weekly Active Users</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Session Duration</span>
                <span className="font-medium">24 min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Pages per Session</span>
                <span className="font-medium">5.2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bounce Rate</span>
                <span className="font-medium">23%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Server Uptime</span>
                <span className="font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Avg Response Time</span>
                <span className="font-medium">145ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Error Rate</span>
                <span className="font-medium text-green-600">0.01%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Storage Usage</span>
                <span className="font-medium text-orange-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Backup Status</span>
                <span className="font-medium text-green-600">Current</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">24</p>
              <p className="text-sm text-muted-foreground">New Users Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-muted-foreground">Courses Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">156</p>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">12</p>
              <p className="text-sm text-muted-foreground">New Enrollments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}