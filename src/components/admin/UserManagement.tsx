import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Search, 
  Filter, 
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Mail,
  Shield
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  registrationDate: string;
  lastLogin: string;
  coursesEnrolled?: number;
  coursesCreated?: number;
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    status: 'active',
    registrationDate: '2024-01-01',
    lastLogin: '2024-01-10',
    coursesEnrolled: 3
  },
  {
    id: '2',
    name: 'Dr. Sarah Martinez',
    email: 'sarah@example.com',
    role: 'teacher',
    status: 'active',
    registrationDate: '2023-12-15',
    lastLogin: '2024-01-10',
    coursesCreated: 2
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    role: 'student',
    status: 'pending',
    registrationDate: '2024-01-08',
    lastLogin: 'Never',
    coursesEnrolled: 0
  },
  {
    id: '4',
    name: 'Prof. Maria Garcia',
    email: 'maria@example.com',
    role: 'teacher',
    status: 'pending',
    registrationDate: '2024-01-09',
    lastLogin: 'Never',
    coursesCreated: 0
  },
  {
    id: '5',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'student',
    status: 'active',
    registrationDate: '2024-01-02',
    lastLogin: '2024-01-09',
    coursesEnrolled: 2
  },
  {
    id: '6',
    name: 'Robert Wilson',
    email: 'robert@example.com',
    role: 'admin',
    status: 'active',
    registrationDate: '2023-11-01',
    lastLogin: '2024-01-10',
    coursesEnrolled: 0,
    coursesCreated: 0
  }
];

export function UserManagement() {
  const [users, setUsers] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const updateUserStatus = (userId: string, newStatus: 'active' | 'pending' | 'suspended') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const updateUserRole = (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const deleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'teacher':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;
  const teacherCount = users.filter(u => u.role === 'teacher').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>User Management</h2>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalUsers}</p>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{pendingUsers}</p>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{teacherCount}</p>
              <p className="text-sm text-muted-foreground">Teachers</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-semibold text-primary text-sm">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{user.name}</h3>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>Registered: {new Date(user.registrationDate).toLocaleDateString()}</span>
                      <span>Last login: {user.lastLogin === 'Never' ? 'Never' : new Date(user.lastLogin).toLocaleDateString()}</span>
                      {user.coursesEnrolled !== undefined && (
                        <span>Enrolled: {user.coursesEnrolled} courses</span>
                      )}
                      {user.coursesCreated !== undefined && user.coursesCreated > 0 && (
                        <span>Created: {user.coursesCreated} courses</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateUserStatus(user.id, 'suspended')}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateUserStatus(user.id, 'active')}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Message
                      </DropdownMenuItem>
                      
                      {user.status === 'active' && (
                        <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'suspended')}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                      )}
                      
                      {user.status === 'suspended' && (
                        <DropdownMenuItem onClick={() => updateUserStatus(user.id, 'active')}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Reactivate User
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteUser(user.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {pendingUsers > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bulk Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => {
                  users.filter(u => u.status === 'pending').forEach(user => {
                    updateUserStatus(user.id, 'active');
                  });
                }}
              >
                Approve All Pending Users
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  users.filter(u => u.status === 'pending').forEach(user => {
                    updateUserStatus(user.id, 'suspended');
                  });
                }}
              >
                Reject All Pending Users
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}