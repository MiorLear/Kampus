import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Download, FileText, Users, BookOpen, BarChart3, Calendar } from 'lucide-react';
import { User, Course } from '../../services/firestore.service';
import { FirestoreService } from '../../services/firestore.service';
import { toast } from 'sonner';

interface ReportsExportProps {
  users: User[];
  courses: Course[];
}

export function ReportsExport({ users, courses }: ReportsExportProps) {
  const [reportType, setReportType] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  const reportTypes = [
    {
      id: 'users',
      name: 'Users Report',
      description: 'Export all users with their roles and activity',
      icon: Users,
    },
    {
      id: 'courses',
      name: 'Courses Report',
      description: 'Export all courses with enrollment statistics',
      icon: BookOpen,
    },
    {
      id: 'enrollments',
      name: 'Enrollments Report',
      description: 'Export student enrollments and progress',
      icon: BarChart3,
    },
    {
      id: 'activity',
      name: 'Activity Report',
      description: 'Export system activity logs',
      icon: Calendar,
    },
  ];

  const dateRanges = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const getDateRange = () => {
    const now = new Date();
    
    switch (dateRange) {
      case 'today':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
          end: now,
        };
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return { start: weekStart, end: now };
      case 'month':
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: now,
        };
      case 'quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        return { start: quarterStart, end: now };
      case 'year':
        return {
          start: new Date(now.getFullYear(), 0, 1),
          end: now,
        };
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : null,
          end: customEndDate ? new Date(customEndDate) : null,
        };
      default:
        return { start: null, end: null };
    }
  };

  const exportUsersReport = async () => {
    const students = users.filter(u => u.role === 'student');
    const teachers = users.filter(u => u.role === 'teacher');
    const admins = users.filter(u => u.role === 'admin');

    const csvContent = [
      ['Name', 'Email', 'Role', 'Created Date', 'Photo URL'].join(','),
      ...users.map(user => [
        `"${user.name}"`,
        `"${user.email}"`,
        user.role,
        user.created_at,
        user.photo_url || ''
      ].join(','))
    ].join('\n');

    downloadCSV(csvContent, 'users_report');
  };

  const exportCoursesReport = async () => {
    const csvContent = [
      ['Title', 'Description', 'Teacher', 'Created Date', 'Updated Date'].join(','),
      ...courses.map(course => {
        const teacher = users.find(u => u.id === course.teacher_id);
        return [
          `"${course.title}"`,
          `"${course.description}"`,
          `"${teacher?.name || 'Unknown'}"`,
          course.created_at,
          course.updated_at
        ].join(',');
      })
    ].join('\n');

    downloadCSV(csvContent, 'courses_report');
  };

  const exportEnrollmentsReport = async () => {
    try {
      const allEnrollments = [];
      
      for (const course of courses) {
        const enrollments = await FirestoreService.getEnrollmentsByCourse(course.id);
        for (const enrollment of enrollments) {
          const student = users.find(u => u.id === enrollment.student_id);
          const teacher = users.find(u => u.id === course.teacher_id);
          
          allEnrollments.push({
            studentName: student?.name || 'Unknown',
            studentEmail: student?.email || 'Unknown',
            courseTitle: course.title,
            teacherName: teacher?.name || 'Unknown',
            progress: enrollment.progress,
            enrolledAt: enrollment.enrolled_at,
          });
        }
      }

      const csvContent = [
        ['Student Name', 'Student Email', 'Course Title', 'Teacher', 'Progress (%)', 'Enrolled Date'].join(','),
        ...allEnrollments.map(enrollment => [
          `"${enrollment.studentName}"`,
          `"${enrollment.studentEmail}"`,
          `"${enrollment.courseTitle}"`,
          `"${enrollment.teacherName}"`,
          enrollment.progress,
          enrollment.enrolledAt
        ].join(','))
      ].join('\n');

      downloadCSV(csvContent, 'enrollments_report');
    } catch (error) {
      console.error('Error exporting enrollments:', error);
      toast.error('Failed to export enrollments report');
    }
  };

  const exportActivityReport = async () => {
    try {
      const activityLogs = await FirestoreService.getAllActivityLogs(1000);
      const { start, end } = getDateRange();
      
      let filteredLogs = activityLogs;
      if (start && end) {
        filteredLogs = activityLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= start && logDate <= end;
        });
      }

      const csvContent = [
        ['Timestamp', 'User', 'Action', 'Details'].join(','),
        ...filteredLogs.map(log => {
          const user = users.find(u => u.id === log.user_id);
          return [
            log.timestamp,
            `"${user?.name || 'Unknown'}"`,
            log.action,
            `"${JSON.stringify(log.metadata || {})}"`
          ].join(',');
        })
      ].join('\n');

      downloadCSV(csvContent, 'activity_report');
    } catch (error) {
      console.error('Error exporting activity:', error);
      toast.error('Failed to export activity report');
    }
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const handleExport = async () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    setExporting(true);
    try {
      switch (reportType) {
        case 'users':
          await exportUsersReport();
          break;
        case 'courses':
          await exportCoursesReport();
          break;
        case 'enrollments':
          await exportEnrollmentsReport();
          break;
        case 'activity':
          await exportActivityReport();
          break;
        default:
          toast.error('Invalid report type');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const selectedReport = reportTypes.find(r => r.id === reportType);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Reports
          </CardTitle>
          <CardDescription>
            Generate and download various system reports in CSV format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map(report => (
                  <SelectItem key={report.id} value={report.id}>
                    <div className="flex items-center gap-2">
                      <report.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">{report.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map(range => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Report Preview */}
          {selectedReport && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <selectedReport.icon className="h-8 w-8 text-primary" />
                  <div>
                    <h4 className="font-medium">{selectedReport.name}</h4>
                    <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={!reportType || exporting}
            className="w-full"
            size="lg"
          >
            {exporting ? (
              <>
                <FileText className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Courses</span>
            </div>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Report Types</span>
            </div>
            <div className="text-2xl font-bold">{reportTypes.length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
