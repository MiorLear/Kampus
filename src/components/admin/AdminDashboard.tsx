import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  UserCheck,
  Settings,
  BarChart3,
  Activity,
  Loader2,
  FileText,
  MessageSquare,
  Download,
  ClipboardList,
  MoreHorizontal
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import { CourseManagement } from './CourseManagement';
import { EnrollmentManagement } from './EnrollmentManagement';
import { AdminAnalytics } from './AdminAnalytics';
import { SystemSettings } from './SystemSettings';
import { AssignmentManagement } from './AssignmentManagement';
import { ActivityLogs } from './ActivityLogs';
import { MessageManagement } from './MessageManagement';
import { ReportsExport } from './ReportsExport';
import { useUsers, useCourses, useAnalytics } from '../../hooks/useFirestore';
import { FirestoreService } from '../../services/firestore.service';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  photo_url?: string;
}

interface AdminDashboardProps {
  user: UserProfile;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [enrollmentsCount, setEnrollmentsCount] = useState(0);
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  
  const { users, loading: usersLoading } = useUsers();
  const { courses, loading: coursesLoading } = useCourses();
  const { analytics, loading: analyticsLoading } = useAnalytics('system');

  useEffect(() => {
    // Load additional stats
    const loadStats = async () => {
      try {
        const stats = await FirestoreService.getSystemAnalytics();
        if (stats) {
          setEnrollmentsCount(stats.totalEnrollments);
          setAssignmentsCount(stats.totalAssignments);
        }
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  if (usersLoading || coursesLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const students = users.filter(u => u.role === 'student');
  const teachers = users.filter(u => u.role === 'teacher');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your LMS platform</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {students.length} students • {teachers.length} teachers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Enrollments</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{enrollmentsCount}</div>
            <p className="text-xs text-muted-foreground">Active enrollments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Assignments</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{assignmentsCount}</div>
            <p className="text-xs text-muted-foreground">Total assignments</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-auto grid-cols-4">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setActiveTab('assignments')}>
                <FileText className="mr-2 h-4 w-4" />
                Assignments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('enrollments')}>
                <UserCheck className="mr-2 h-4 w-4" />
                Enrollments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('messages')}>
                <MessageSquare className="mr-2 h-4 w-4" />
                Messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('activity')}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Activity Logs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('reports')}>
                <Download className="mr-2 h-4 w-4" />
                Reports
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <AdminAnalytics users={users} courses={courses} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="courses">
          <CourseManagement courses={courses} users={users} />
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentManagement courses={courses} users={users} />
        </TabsContent>

        <TabsContent value="enrollments">
          <EnrollmentManagement courses={courses} users={users} />
        </TabsContent>

        <TabsContent value="messages">
          <MessageManagement users={users} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLogs users={users} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsExport users={users} courses={courses} />
        </TabsContent>

        <TabsContent value="analytics">
          <AdminAnalytics users={users} courses={courses} />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
