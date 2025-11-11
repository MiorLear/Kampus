import React, { useState } from 'react';
import { Button } from '../ui/button';
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
import { useUsers, useCourses } from '../../hooks/useFirestore';

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
  
  const { users, loading: usersLoading } = useUsers();
  const { courses, loading: coursesLoading } = useCourses();

  if (usersLoading || coursesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your LMS platform</p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <TabsList>
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="courses">
              <BookOpen className="h-4 w-4" />
              Courses
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

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
