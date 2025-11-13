import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  defaultTab?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  path: string;
}

// Define tabs outside component to avoid recreation
const ADMIN_TABS: Omit<TabItem, 'icon'>[] = [
  { id: 'overview', label: 'Overview', value: 'overview', path: '/admin/overview' },
  { id: 'users', label: 'Users', value: 'users', path: '/admin/users' },
  { id: 'courses', label: 'Courses', value: 'courses', path: '/admin/courses' },
  { id: 'assignments', label: 'Assignments', value: 'assignments', path: '/admin/assignments' },
  { id: 'enrollments', label: 'Enrollments', value: 'enrollments', path: '/admin/enrollments' },
  { id: 'messages', label: 'Messages', value: 'messages', path: '/admin/messages' },
  { id: 'activity', label: 'Activity Logs', value: 'activity', path: '/admin/activity' },
  { id: 'reports', label: 'Reports', value: 'reports', path: '/admin/reports' },
  { id: 'settings', label: 'Settings', value: 'settings', path: '/admin/settings' },
];

export function AdminDashboard({ user, defaultTab }: AdminDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  
  
  const tabsListRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  
  const { users, loading: usersLoading, refreshUsers } = useUsers();
  const { courses, loading: coursesLoading, refreshCourses } = useCourses();

  // Create tabs with icons - use useMemo to prevent recreation on every render
  const allTabs: TabItem[] = useMemo(() => [
    { ...ADMIN_TABS[0], icon: <Activity className="h-4 w-4" /> },
    { ...ADMIN_TABS[1], icon: <Users className="h-4 w-4" /> },
    { ...ADMIN_TABS[2], icon: <BookOpen className="h-4 w-4" /> },
    { ...ADMIN_TABS[3], icon: <FileText className="h-4 w-4" /> },
    { ...ADMIN_TABS[4], icon: <UserCheck className="h-4 w-4" /> },
    { ...ADMIN_TABS[5], icon: <MessageSquare className="h-4 w-4" /> },
    { ...ADMIN_TABS[6], icon: <ClipboardList className="h-4 w-4" /> },
    { ...ADMIN_TABS[7], icon: <Download className="h-4 w-4" /> },
    { ...ADMIN_TABS[8], icon: <Settings className="h-4 w-4" /> },
  ], []);

  // Initialize with all tabs visible, will be calculated on mount
  const [visibleTabs, setVisibleTabs] = useState<string[]>(ADMIN_TABS.map(t => t.value));
  const [hiddenTabs, setHiddenTabs] = useState<string[]>([]);

  // Sync activeTab with URL
  useEffect(() => {
    const pathToTab = allTabs.find(tab => tab.path === location.pathname);
    if (pathToTab && pathToTab.value !== activeTab) {
      setActiveTab(pathToTab.value);
    }
  }, [location.pathname, allTabs, activeTab]);

  // Initialize from defaultTab or URL
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else {
      const pathToTab = allTabs.find(tab => tab.path === location.pathname);
      if (pathToTab) {
        setActiveTab(pathToTab.value);
      }
    }
  }, [defaultTab, location.pathname, allTabs]);

  // Handle tab change - update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const tab = allTabs.find(t => t.value === value);
    if (tab) {
      navigate(tab.path, { replace: true });
    }
  };

  // Dynamic tab visibility based on screen size
  useEffect(() => {
    const updateTabVisibility = () => {
      if (!tabsListRef.current || !tabsRef.current) {
        return false;
      }

      const containerWidth = tabsRef.current.offsetWidth;
      if (containerWidth === 0) {
        return false;
      }

      const dropdownButtonWidth = 120; // Approximate width of dropdown button
      const availableWidth = containerWidth - dropdownButtonWidth - 32; // 32px for padding/margins
      
      const tabsList = tabsListRef.current;
      const tabsListElement = tabsList?.querySelector('[data-slot="tabs-list"]') as HTMLElement;
      if (!tabsListElement) {
        return false;
      }
      
      const tabElements = Array.from(tabsListElement.children) as HTMLElement[];
      if (tabElements.length === 0) {
        return false;
      }
      
      let totalWidth = 0;
      const newVisibleTabs: string[] = [];
      const newHiddenTabs: string[] = [];

      for (const tab of allTabs) {
        const tabElement = tabElements.find(el => el.getAttribute('data-value') === tab.value);
        if (tabElement) {
          const tabWidth = tabElement.offsetWidth || 100; // Fallback width
          if (totalWidth + tabWidth <= availableWidth) {
            totalWidth += tabWidth;
            newVisibleTabs.push(tab.value);
          } else {
            newHiddenTabs.push(tab.value);
          }
        } else {
          // If tab is not rendered yet, estimate width
          const estimatedWidth = tab.label.length * 8 + 40; // Rough estimate
          if (totalWidth + estimatedWidth <= availableWidth) {
            totalWidth += estimatedWidth;
            newVisibleTabs.push(tab.value);
          } else {
            newHiddenTabs.push(tab.value);
          }
        }
      }

      // Always show at least the first 3 tabs
      if (newVisibleTabs.length < 3) {
        newVisibleTabs.push(...newHiddenTabs.splice(0, 3 - newVisibleTabs.length));
      }

      // Only update if values actually changed to prevent infinite loops
      setVisibleTabs(prev => {
        const prevSorted = [...prev].sort();
        const newSorted = [...newVisibleTabs].sort();
        if (JSON.stringify(prevSorted) !== JSON.stringify(newSorted)) {
          return newVisibleTabs;
        }
        return prev;
      });
      
      setHiddenTabs(prev => {
        const prevSorted = [...prev].sort();
        const newSorted = [...newHiddenTabs].sort();
        if (JSON.stringify(prevSorted) !== JSON.stringify(newSorted)) {
          return newHiddenTabs;
        }
        return prev;
      });
      
      return true;
    };

    // Use multiple attempts to ensure DOM is ready
    const timeouts: NodeJS.Timeout[] = [];
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryUpdate = () => {
      attempts++;
      const success = updateTabVisibility();
      if (!success && attempts < maxAttempts) {
        timeouts.push(setTimeout(tryUpdate, 50));
      }
    };
    
    // Start trying immediately
    tryUpdate();
    
    // Also try after next frame
    requestAnimationFrame(() => {
      tryUpdate();
    });
    
    window.addEventListener('resize', updateTabVisibility);
    
    return () => {
      window.removeEventListener('resize', updateTabVisibility);
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [allTabs]); // Remove activeTab dependency to prevent infinite loops

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
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <div ref={tabsRef} className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div ref={tabsListRef} className="flex-1 min-w-0">
            <TabsList className="w-full">
            {allTabs.map((tab) => {
              const isVisible = visibleTabs.length === 0 || visibleTabs.includes(tab.value);
              if (!isVisible) return null;
              const isActive = activeTab === tab.value;
              return (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.value}
                    data-value={tab.value}
                    className={isActive 
                      ? '!bg-primary !text-primary-foreground !shadow-md !font-semibold' 
                      : ''
                    }
                    style={isActive ? { 
                      backgroundColor: 'var(--primary)', 
                      color: 'var(--primary-foreground)',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
                      fontWeight: '600',
                      zIndex: 1
                    } : {}}
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                );
              }).filter(Boolean)}
            </TabsList>
          </div>
          
          {hiddenTabs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4 mr-2" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {allTabs
                  .filter(tab => hiddenTabs.includes(tab.value))
                  .map((tab) => (
                    <DropdownMenuItem 
                      key={tab.id}
                      onClick={() => handleTabChange(tab.value)}
                      className={activeTab === tab.value ? 'bg-primary/10 font-semibold' : ''}
                    >
                      {tab.icon}
                      <span className="ml-2">{tab.label}</span>
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <TabsContent value="overview" className="space-y-4">
          <AdminAnalytics users={users} courses={courses} />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement users={users} />
        </TabsContent>

        <TabsContent value="courses">
          <CourseManagement courses={courses} users={users} onCourseUpdate={refreshCourses} />
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

// Default export for lazy loading
export default AdminDashboard;