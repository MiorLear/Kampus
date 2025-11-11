import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search, Filter, Download, RefreshCw, Activity, User, Clock } from 'lucide-react';
import { ActivityLog, User as UserType } from '../../services/firestore.service';
import { FirestoreService } from '../../services/firestore.service';
import { toast } from 'sonner';
import { formatDate } from '../../utils/firebase-helpers';

interface ActivityLogsProps {
  users: UserType[];
}

export function ActivityLogs({ users }: ActivityLogsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadActivityLogs();
  }, []);

  const loadActivityLogs = async () => {
    try {
      setLoading(true);
      const activityLogs = await ApiService.getAllActivityLogs(100);
      setLogs(activityLogs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadActivityLogs();
    setRefreshing(false);
    toast.success('Activity logs refreshed');
  };

  const filteredLogs = logs.filter(log => {
    const user = users.find(u => u.id === log.user_id);
    
    const matchesSearch = (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (user?.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesUser = userFilter === 'all' || log.user_id === userFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    
    return matchesSearch && matchesUser && matchesAction;
  });

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.name || 'Unknown User';
  };

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || 'Unknown Email';
  };

  const getActionBadge = (action: string) => {
    const actionColors: Record<string, string> = {
      'login': 'bg-green-100 text-green-800',
      'logout': 'bg-gray-100 text-gray-800',
      'course_created': 'bg-blue-100 text-blue-800',
      'course_updated': 'bg-yellow-100 text-yellow-800',
      'course_deleted': 'bg-red-100 text-red-800',
      'assignment_created': 'bg-purple-100 text-purple-800',
      'assignment_submitted': 'bg-indigo-100 text-indigo-800',
      'user_created': 'bg-green-100 text-green-800',
      'user_updated': 'bg-yellow-100 text-yellow-800',
      'user_deleted': 'bg-red-100 text-red-800',
      'enrollment_created': 'bg-blue-100 text-blue-800',
      'enrollment_deleted': 'bg-red-100 text-red-800',
    };

    const colorClass = actionColors[action] || 'bg-gray-100 text-gray-800';
    return <Badge className={colorClass}>{action.replace(/_/g, ' ')}</Badge>;
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Email', 'Action', 'Details'].join(','),
      ...filteredLogs.map(log => [
        formatDate(log.timestamp),
        getUserName(log.user_id),
        getUserEmail(log.user_id),
        log.action,
        JSON.stringify(log.metadata || {})
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Activity logs exported successfully');
  };

  const getUniqueActions = () => {
    const actions = [...new Set(logs.map(log => log.action))];
    return actions.sort();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activity Logs
            </CardTitle>
            <CardDescription>
              Monitor user activities and system events
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={exportLogs}
              variant="outline"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              {getUniqueActions().map(action => (
                <SelectItem key={action} value={action}>
                  {action.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading activity logs...
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No activity logs found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(log.timestamp)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{getUserName(log.user_id)}</div>
                            <div className="text-sm text-muted-foreground">
                              {getUserEmail(log.user_id)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>
                          {log.metadata ? (
                            <div className="text-sm text-muted-foreground">
                              {Object.entries(log.metadata).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium">{key}:</span> {String(value)}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No details</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {filteredLogs.length} of {logs.length} activity logs
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
