import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Globe, Clock, Bell, Palette, Edit, Info } from 'lucide-react';
import { UserProfile, DEFAULT_PREFERENCES } from '../../../../types/user-profiles';

interface PreferencesSectionProps {
  profile: UserProfile;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function PreferencesSection({ profile, onEdit, canEdit }: PreferencesSectionProps) {
  // Use default preferences if none exist
  const preferences = profile.preferences || DEFAULT_PREFERENCES;
  const { language, timezone, notifications_enabled, theme } = preferences;
  const hasPreferences = !!profile.preferences;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>User preferences and settings</CardDescription>
            </div>
            {canEdit && onEdit && (
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasPreferences && (
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">No preferences configured</p>
                <p className="text-sm text-blue-700">
                  Your preferences are currently set to default values. Click "Edit" to customize your settings.
                </p>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Language */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </label>
              <p className="text-sm mt-1 capitalize">{language === 'es' ? 'Español' : 'English'}</p>
            </div>

            {/* Timezone */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Timezone
              </label>
              <p className="text-sm mt-1">{timezone || 'Not set'}</p>
            </div>

            {/* Notifications */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </label>
              <Badge variant={notifications_enabled ? 'default' : 'secondary'} className="mt-1">
                {notifications_enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>

            {/* Theme */}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Theme
              </label>
              <p className="text-sm mt-1 capitalize">{theme || 'Not set'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

