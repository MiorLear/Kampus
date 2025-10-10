import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  Shield,
  Users,
  BookOpen,
  FileText,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  MapPin,
  Briefcase,
} from 'lucide-react';
import { AdminProfile } from '../../../types/user-profiles';
import { formatDate } from '../../../utils/firebase-helpers';

interface AdminExtensionsProps {
  profile: AdminProfile;
}

export function AdminOverview({ profile }: AdminExtensionsProps) {
  const stats = profile.stats || {
    total_actions_performed: 0,
    users_managed: 0,
    courses_approved: 0,
    reports_generated: 0,
    issues_resolved: 0,
  };

  const getAdminLevelColor = (level: string) => {
    switch (level) {
      case 'super_admin':
        return 'bg-red-500';
      case 'admin':
        return 'bg-orange-500';
      case 'moderator':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Admin Level Badge */}
      <Card className={`border-l-4 ${getAdminLevelColor(profile.admin_level || 'admin')}`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h3 className="font-semibold text-lg capitalize">
                {(profile.admin_level || 'admin').replace(/_/g, ' ')}
              </h3>
              <p className="text-sm text-muted-foreground">Administrative Access Level</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Users Managed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.users_managed}</div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.courses_approved}</div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Reports Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.reports_generated}</div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Issues Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.issues_resolved}</div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Administrative Information */}
      <Card>
        <CardHeader>
          <CardTitle>Administrative Information</CardTitle>
          <CardDescription>Role and department details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.employee_id && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                <p className="text-sm mt-1 font-mono">{profile.employee_id}</p>
              </div>
            )}
            {profile.department && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Department
                </label>
                <p className="text-sm mt-1">{profile.department}</p>
              </div>
            )}
            {profile.position && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Position</label>
                <p className="text-sm mt-1">{profile.position}</p>
              </div>
            )}
            {profile.work_email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Work Email</label>
                <p className="text-sm mt-1">{profile.work_email}</p>
              </div>
            )}
            {profile.work_phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Work Phone</label>
                <p className="text-sm mt-1">{profile.work_phone}</p>
              </div>
            )}
            {profile.office_location && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Office Location
                </label>
                <p className="text-sm mt-1">{profile.office_location}</p>
              </div>
            )}
          </div>

          {/* Responsibilities */}
          {profile.responsibilities && profile.responsibilities.length > 0 && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Responsibilities
              </label>
              <ul className="list-disc list-inside space-y-1">
                {profile.responsibilities.map((resp, index) => (
                  <li key={index} className="text-sm">
                    {resp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Managed Departments */}
          {profile.managed_departments && profile.managed_departments.length > 0 && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Managed Departments
              </label>
              <div className="flex flex-wrap gap-2">
                {profile.managed_departments.map((dept, index) => (
                  <Badge key={index} variant="secondary">
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Permissions
          </CardTitle>
          <CardDescription>System access and capabilities</CardDescription>
        </CardHeader>
        <CardContent>
          {profile.permissions && Object.keys(profile.permissions).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Object.entries(profile.permissions).map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    value ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {value ? (
                      <Unlock className="h-4 w-4 text-green-600" />
                    ) : (
                      <Lock className="h-4 w-4 text-gray-400" />
                    )}
                    <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                  </div>
                  {value ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No permissions configured
            </p>
          )}
        </CardContent>
      </Card>

      {/* Admin Preferences */}
      {profile.admin_preferences && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Preferences</CardTitle>
            <CardDescription>Personal admin settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Default View</label>
                <Badge variant="outline" className="mt-1 capitalize">
                  {profile.admin_preferences.default_view}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Notification Frequency
                </label>
                <Badge variant="outline" className="mt-1 capitalize">
                  {profile.admin_preferences.notification_frequency}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">System Alerts</label>
                <Badge
                  variant={
                    profile.admin_preferences.receive_system_alerts ? 'default' : 'secondary'
                  }
                  className="mt-1"
                >
                  {profile.admin_preferences.receive_system_alerts ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">User Reports</label>
                <Badge
                  variant={
                    profile.admin_preferences.receive_user_reports ? 'default' : 'secondary'
                  }
                  className="mt-1"
                >
                  {profile.admin_preferences.receive_user_reports ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Trail */}
      {profile.audit_trail && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Audit Trail
            </CardTitle>
            <CardDescription>Security and access information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.audit_trail.last_login_ip && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Last Login IP</label>
                <p className="text-sm mt-1 font-mono">{profile.audit_trail.last_login_ip}</p>
              </div>
            )}

            {profile.audit_trail.login_history &&
              profile.audit_trail.login_history.length > 0 && (
                <div className="pt-4 border-t">
                  <label className="text-sm font-medium text-muted-foreground mb-3 block">
                    Recent Login History
                  </label>
                  <div className="space-y-2">
                    {profile.audit_trail.login_history.slice(0, 5).map((login, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{login.device}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">{login.ip_address}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(login.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}

