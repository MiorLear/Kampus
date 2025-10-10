import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Separator } from '../../ui/separator';
import { Loader2, Globe, Palette, Bell, Clock, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile, DEFAULT_PREFERENCES } from '../../../types/user-profiles';
import { UserProfileService } from '../../../services/user-profile.service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';

interface PreferencesEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onUpdate?: () => void;
}

export function PreferencesEditor({
  open,
  onOpenChange,
  profile,
  onUpdate,
}: PreferencesEditorProps) {
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    ...DEFAULT_PREFERENCES,
    ...profile.preferences,
  });

  const [notifications, setNotifications] = useState({
    email_assignments: true,
    email_grades: true,
    email_announcements: true,
    email_messages: true,
    push_assignments: true,
    push_messages: true,
    digest_frequency: 'daily' as 'daily' | 'weekly' | 'never',
  });

  const handlePreferenceChange = (key: string, value: any) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  const handleNotificationChange = (key: string, value: any) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const updateData: any = {
        preferences,
      };

      if (profile.role === 'student') {
        await UserProfileService.updateStudentProfile(profile.id, updateData);
      } else if (profile.role === 'teacher') {
        await UserProfileService.updateTeacherProfile(profile.id, updateData);
      } else if (profile.role === 'admin') {
        await UserProfileService.updateAdminProfile(profile.id, updateData);
      }

      toast.success('Preferences updated successfully!');
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    setPreferences(DEFAULT_PREFERENCES);
    toast.info('Preferences reset to defaults');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Preferences</DialogTitle>
          <DialogDescription>
            Customize your experience and notification settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">
              <Globe className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="h-4 w-4 mr-2" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Localization</CardTitle>
                <CardDescription>Language and timezone settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Language */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground">
                      Select your preferred language
                    </p>
                  </div>
                  <Select
                    value={preferences.language}
                    onValueChange={(value: 'es' | 'en') =>
                      handlePreferenceChange('language', value)
                    }
                    disabled={saving}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Timezone */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="timezone">
                      <Clock className="h-4 w-4 inline mr-2" />
                      Timezone
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Used for scheduling and deadlines
                    </p>
                  </div>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => handlePreferenceChange('timezone', value)}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Mexico_City">Mexico City (GMT-6)</SelectItem>
                      <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                      <SelectItem value="America/Chicago">Chicago (GMT-6)</SelectItem>
                      <SelectItem value="America/Los_Angeles">Los Angeles (GMT-8)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (GMT+1)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Theme & Display</CardTitle>
                <CardDescription>Customize how Kampus looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Theme */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your interface theme
                    </p>
                  </div>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value: 'light' | 'dark' | 'auto') =>
                      handlePreferenceChange('theme', value)
                    }
                    disabled={saving}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-muted-foreground">
                  Auto theme follows your system preferences
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Notification Settings</CardTitle>
                <CardDescription>Control how you receive updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Master Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Master switch for all notifications
                    </p>
                  </div>
                  <Switch
                    checked={preferences.notifications_enabled}
                    onCheckedChange={(checked) =>
                      handlePreferenceChange('notifications_enabled', checked)
                    }
                    disabled={saving}
                  />
                </div>

                <Separator />

                {/* Email Notifications */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Email Notifications</h4>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-assignments" className="font-normal">
                      New assignments
                    </Label>
                    <Switch
                      id="email-assignments"
                      checked={notifications.email_assignments}
                      onCheckedChange={(checked) =>
                        handleNotificationChange('email_assignments', checked)
                      }
                      disabled={saving || !preferences.notifications_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-grades" className="font-normal">
                      Grade updates
                    </Label>
                    <Switch
                      id="email-grades"
                      checked={notifications.email_grades}
                      onCheckedChange={(checked) =>
                        handleNotificationChange('email_grades', checked)
                      }
                      disabled={saving || !preferences.notifications_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-announcements" className="font-normal">
                      Course announcements
                    </Label>
                    <Switch
                      id="email-announcements"
                      checked={notifications.email_announcements}
                      onCheckedChange={(checked) =>
                        handleNotificationChange('email_announcements', checked)
                      }
                      disabled={saving || !preferences.notifications_enabled}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-messages" className="font-normal">
                      Direct messages
                    </Label>
                    <Switch
                      id="email-messages"
                      checked={notifications.email_messages}
                      onCheckedChange={(checked) =>
                        handleNotificationChange('email_messages', checked)
                      }
                      disabled={saving || !preferences.notifications_enabled}
                    />
                  </div>
                </div>

                <Separator />

                {/* Email Digest */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a summary of activity
                    </p>
                  </div>
                  <Select
                    value={notifications.digest_frequency}
                    onValueChange={(value: 'daily' | 'weekly' | 'never') =>
                      handleNotificationChange('digest_frequency', value)
                    }
                    disabled={saving || !preferences.notifications_enabled}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleResetToDefaults}
            disabled={saving}
            className="mr-auto"
          >
            Reset to Defaults
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

