import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { User, Course } from '../../services/firestore.service';
import { FirestoreService } from '../../services/firestore.service';
import { Users, BookOpen, TrendingUp, Activity } from 'lucide-react';

interface AdminAnalyticsProps {
  users: User[];
  courses: Course[];
}

export function AdminAnalytics({ users, courses }: AdminAnalyticsProps) {
  const [enrollmentData, setEnrollmentData] = useState<any[]>([]);
  const [courseData, setCourseData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [users, courses]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Load course enrollment data
      const courseEnrollments = await Promise.all(
        courses.slice(0, 10).map(async (course) => {
          if (!course || !course.id || !course.title) return null;
          const enrollments = await FirestoreService.getEnrollmentsByCourse(course.id);
          return {
            name: course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title,
            students: enrollments.length,
            avgProgress: enrollments.length > 0
              ? enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length
              : 0,
          };
        })
      );
      
      // Filter out null values
      const validCourseEnrollments = courseEnrollments.filter(c => c !== null);

      setCourseData(validCourseEnrollments);

      // Prepare user distribution data
      const roleData = [
        { name: 'Students', value: users.filter(u => u.role === 'student').length, color: '#3b82f6' },
        { name: 'Teachers', value: users.filter(u => u.role === 'teacher').length, color: '#10b981' },
        { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#ef4444' },
      ];

      setEnrollmentData(roleData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.length}</div>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-muted-foreground">
                Students: {students.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Teachers: {teachers.length}
              </div>
              <div className="text-xs text-muted-foreground">
                Admins: {admins.length}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{courses.length}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Active platform courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Student/Teacher Ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {teachers.length > 0 ? (students.length / teachers.length).toFixed(1) : '0'}:1
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Students per teacher
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Courses/Teacher</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">
              {teachers.length > 0 ? (courses.length / teachers.length).toFixed(1) : '0'}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Courses per teacher
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
            <CardDescription>Breakdown by role</CardDescription>
          </CardHeader>
          <CardContent>
            {enrollmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={enrollmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {enrollmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Course Enrollments Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Course Enrollments</CardTitle>
            <CardDescription>Students per course (Top 10)</CardDescription>
          </CardHeader>
          <CardContent>
            {courseData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={courseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="students" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No courses available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Role Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Distribution</CardTitle>
          <CardDescription>Detailed breakdown of platform users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Students</span>
              <span className="text-sm">{students.length} ({users.length > 0 ? ((students.length / users.length) * 100).toFixed(1) : 0}%)</span>
            </div>
            <Progress value={users.length > 0 ? (students.length / users.length) * 100 : 0} className="bg-blue-100" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Teachers</span>
              <span className="text-sm">{teachers.length} ({users.length > 0 ? ((teachers.length / users.length) * 100).toFixed(1) : 0}%)</span>
            </div>
            <Progress value={users.length > 0 ? (teachers.length / users.length) * 100 : 0} className="bg-green-100" />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Admins</span>
              <span className="text-sm">{admins.length} ({users.length > 0 ? ((admins.length / users.length) * 100).toFixed(1) : 0}%)</span>
            </div>
            <Progress value={users.length > 0 ? (admins.length / users.length) * 100 : 0} className="bg-red-100" />
          </div>
        </CardContent>
      </Card>

      {/* Course Progress Overview */}
      {courseData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Course Progress Overview</CardTitle>
            <CardDescription>Average student progress per course</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgProgress" 
                  stroke="#10b981" 
                  name="Avg Progress (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
