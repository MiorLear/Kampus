import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  UserCheck,
  Settings,
  BarChart3,
  Shield,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import { CourseManagement } from './CourseManagement';
import { EnrollmentManagement } from './EnrollmentManagement';
import { AdminAnalytics } from './AdminAnalytics';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const mockSystemStats = {
  totalUsers: 1247,
  totalCourses: 45,
  totalEnrollments: 2890,
  activeUsers: 856,
  pendingApprovals: 23,
  systemHealth: 98,
  serverUptime: '99.9%',
  avgResponseTime: '145ms'
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'user_registration',
    description: 'New teacher registration: Dr. Maria Garcia',
    timestamp: '2024-01-10T14:30:00Z',
    status: 'pending'
  },
  {
    id: '2',
    type: 'course_published',
    description: 'Course "Advanced Python" published by Prof. Smith',
    timestamp: '2024-01-10T13:15:00Z',
    status: 'completed'
  },
  {
    id: '3',
    type: 'bulk_enrollment',
    description: '15 students enrolled in "Web Development Basics"',
    timestamp: '2024-01-10T12:00:00Z',
    status: 'completed'
  },
  {
    id: '4',
    type: 'system_alert',
    description: 'High server load detected during peak hours',
    timestamp: '2024-01-10T11:30:00Z',
    status: 'warning'
  }
];

const mockSystemAlerts = [
  {
    id: '1',
    type: 'warning',
    title: 'High Storage Usage',
    message: 'Server storage is at 85% capacity',
    timestamp: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    type: 'info',
    title: 'Scheduled Maintenance',
    message: 'System maintenance scheduled for this weekend',
    timestamp: '2024-01-10T09:00:00Z'
  },
  {
    id: '3',
    type: 'success',
    title: 'Backup Completed',
    message: 'Daily database backup completed successfully',
    timestamp: '2024-01-10T08:00:00Z'
  }
];

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System administration and management</p>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{mockSystemStats.totalUsers}</p>
                    <p className="text-xs text-green-600">+24 this week</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                    <p className="text-2xl font-bold">{mockSystemStats.totalCourses}</p>
                    <p className="text-xs text-green-600">+3 this week</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Users</p>
                    <p className="text-2xl font-bold">{mockSystemStats.activeUsers}</p>
                    <p className="text-xs text-blue-600">Last 7 days</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">System Health</p>
                    <p className="text-2xl font-bold">{mockSystemStats.systemHealth}%</p>
                    <p className="text-xs text-green-600">All systems operational</p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button className="h-24 flex-col gap-2" onClick={() => setActiveView('users')}>
                  <Users className="h-6 w-6" />
                  Manage Users
                </Button>
                <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => setActiveView('courses')}>
                  <BookOpen className="h-6 w-6" />
                  Course Management
                </Button>
                <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => setActiveView('enrollments')}>
                  <UserCheck className="h-6 w-6" />
                  Enrollments
                </Button>
                <Button className="h-24 flex-col gap-2" variant="outline" onClick={() => setActiveView('analytics')}>
                  <BarChart3 className="h-6 w-6" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map(activity => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="mt-1">
                        {activity.type === 'user_registration' && <Users className="h-4 w-4 text-blue-600" />}
                        {activity.type === 'course_published' && <BookOpen className="h-4 w-4 text-green-600" />}
                        {activity.type === 'bulk_enrollment' && <UserCheck className="h-4 w-4 text-purple-600" />}
                        {activity.type === 'system_alert' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={
                        activity.status === 'completed' ? 'default' :
                        activity.status === 'pending' ? 'secondary' : 'outline'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>Important notifications and warnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockSystemAlerts.map(alert => (
                    <div key={alert.id} className={`p-3 rounded-lg border ${
                      alert.type === 'warning' ? 'border-orange-200 bg-orange-50' :
                      alert.type === 'success' ? 'border-green-200 bg-green-50' :
                      'border-blue-200 bg-blue-50'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                          {alert.type === 'success' && <UserCheck className="h-4 w-4 text-green-600" />}
                          {alert.type === 'info' && <Clock className="h-4 w-4 text-blue-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{alert.title}</p>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Performance */}
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Real-time system metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Server Uptime</span>
                    <span className="text-sm text-muted-foreground">{mockSystemStats.serverUptime}</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Usage</span>
                    <span className="text-sm text-muted-foreground">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Sessions</span>
                    <span className="text-sm text-muted-foreground">456</span>
                  </div>
                  <Progress value={76} className="h-2" />
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{mockSystemStats.avgResponseTime}</p>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{mockSystemStats.pendingApprovals}</p>
                  <p className="text-sm text-muted-foreground">Pending Approvals</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{mockSystemStats.totalEnrollments}</p>
                  <p className="text-sm text-muted-foreground">Total Enrollments</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">24/7</p>
                  <p className="text-sm text-muted-foreground">System Monitoring</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          {mockSystemStats.pendingApprovals > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Attention Required
                </CardTitle>
                <CardDescription>Actions that need your immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50">
                    <div>
                      <p className="font-medium">Pending User Approvals</p>
                      <p className="text-sm text-muted-foreground">
                        {mockSystemStats.pendingApprovals} user registrations require approval
                      </p>
                    </div>
                    <Button onClick={() => setActiveView('users')}>
                      Review Users
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                    <div>
                      <p className="font-medium">Course Reviews</p>
                      <p className="text-sm text-muted-foreground">
                        5 courses pending review for publication
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setActiveView('courses')}>
                      Review Courses
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <CourseManagement />
        </TabsContent>

        <TabsContent value="enrollments" className="space-y-6">
          <EnrollmentManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <AdminAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
}