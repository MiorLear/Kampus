import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Globe, Clock, Bell, Palette, Edit } from 'lucide-react';
import { UserProfile } from '../../../../types/user-profiles';

interface PreferencesSectionProps {
  profile: UserProfile;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function PreferencesSection({ profile, onEdit, canEdit }: PreferencesSectionProps) {
  if (!profile.preferences) return null;

  const { language, timezone, notifications_enabled, theme } = profile.preferences;

  return (
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
            <p className="text-sm mt-1">{timezone}</p>
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
            <p className="text-sm mt-1 capitalize">{theme}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

