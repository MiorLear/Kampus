import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { Save, Shield, Database, Bell, Mail } from 'lucide-react';

export function SystemSettings() {
  const [settings, setSettings] = useState({
    siteName: 'Kampus LMS',
    allowRegistration: true,
    requireEmailVerification: true,
    enableNotifications: true,
    enableAnalytics: true,
    maxFileSize: '10',
    sessionTimeout: '30',
  });

  const handleSave = () => {
    // In a real app, this would save to Firebase or backend
    toast.success('Settings saved successfully');
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic platform settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow User Registration</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to register accounts
              </p>
            </div>
            <Switch
              checked={settings.allowRegistration}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, allowRegistration: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Users must verify their email before accessing the platform
              </p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, requireEmailVerification: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security and access controls</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
            <Input
              id="sessionTimeout"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              How long before inactive users are logged out
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxFileSize">Max File Upload Size (MB)</Label>
            <Input
              id="maxFileSize"
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => setSettings({ ...settings, maxFileSize: e.target.value })}
            />
            <p className="text-sm text-muted-foreground">
              Maximum file size for uploads
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send notifications to users about important events
              </p>
            </div>
            <Switch
              checked={settings.enableNotifications}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableNotifications: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            <div>
              <CardTitle>Analytics & Data</CardTitle>
              <CardDescription>Configure data collection and analytics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Collect usage data for platform improvement
              </p>
            </div>
            <Switch
              checked={settings.enableAnalytics}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, enableAnalytics: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4>Clear All Activity Logs</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete all activity logs
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Clear Logs
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <h4>Reset All Statistics</h4>
              <p className="text-sm text-muted-foreground">
                Reset all analytics and statistics data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Reset Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 h-4 w-4" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
