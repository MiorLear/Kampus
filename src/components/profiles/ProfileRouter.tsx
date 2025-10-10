import React, { useState } from 'react';
import { ProfileLayout } from './BaseProfile/ProfileLayout';
import { PersonalInfo } from './BaseProfile/shared/PersonalInfo';
import { PreferencesSection } from './BaseProfile/shared/PreferencesSection';
import { StudentOverview } from './extensions/StudentExtensions';
import { TeacherOverview } from './extensions/TeacherExtensions';
import { AdminOverview } from './extensions/AdminExtensions';
import { PhotoUploadDialog } from './editors/PhotoUploadDialog';
import { ContactInfoEditor } from './editors/ContactInfoEditor';
import { PreferencesEditor } from './editors/PreferencesEditor';
import {
  UserProfile,
  StudentProfile,
  TeacherProfile,
  AdminProfile,
  isStudentProfile,
  isTeacherProfile,
  isAdminProfile,
} from '../../types/user-profiles';
import { BookOpen, GraduationCap, Shield, Mail, UserCircle, Settings, Camera } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

interface ProfileRouterProps {
  profile: UserProfile;
  onEdit?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  canEdit?: boolean;
  onProfileUpdate?: () => void;
}

/**
 * ProfileRouter: Main component that routes to the appropriate profile view
 * based on user role. Uses hybrid approach with shared base + role extensions.
 */
export function ProfileRouter({ profile, onEdit, onExport, onShare, canEdit, onProfileUpdate }: ProfileRouterProps) {
  const [showPhotoDialog, setShowPhotoDialog] = useState(false);
  const [showContactEditor, setShowContactEditor] = useState(false);
  const [showPreferencesEditor, setShowPreferencesEditor] = useState(false);
  const [localProfile, setLocalProfile] = useState(profile);

  const handleProfileUpdate = () => {
    onProfileUpdate?.();
    // Refresh local profile state
    setLocalProfile({ ...localProfile });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'teacher':
        return 'default' as const;
      case 'student':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'suspended':
        return 'bg-red-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };
  // Render Overview based on role
  const renderOverview = () => {
    if (isStudentProfile(profile)) {
      return <StudentOverview profile={profile as StudentProfile} />;
    }
    if (isTeacherProfile(profile)) {
      return <TeacherOverview profile={profile as TeacherProfile} />;
    }
    if (isAdminProfile(profile)) {
      return <AdminOverview profile={profile as AdminProfile} />;
    }
    return null;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar with Edit Button */}
            <div className="flex flex-col items-center md:items-start relative">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={localProfile.photo_url} alt={localProfile.name} />
                  <AvatarFallback className="text-2xl">{getInitials(localProfile.name)}</AvatarFallback>
                </Avatar>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                    onClick={() => setShowPhotoDialog(true)}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(localProfile.status)}`} />
                <span className="text-sm text-muted-foreground capitalize">{localProfile.status}</span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{localProfile.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant={getRoleBadgeVariant(localProfile.role)}>
                      {localProfile.role.toUpperCase()}
                    </Badge>
                    {localProfile.email_verified && (
                      <Badge variant="outline" className="bg-green-50">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{localProfile.email}</span>
                    </div>
                    {localProfile.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>{localProfile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Profile Content */}
      <div className="flex-1">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">
              <UserCircle className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="contact">
              <Mail className="h-4 w-4 mr-2" />
              Contact
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Role Specific */}
          <TabsContent value="overview" className="space-y-4">
            {renderOverview()}
          </TabsContent>


          {/* Preferences Tab - Shared */}
          <TabsContent value="preferences" className="space-y-4">
            <PreferencesSection 
              profile={localProfile}
              onEdit={() => setShowPreferencesEditor(true)}
              canEdit={canEdit}
            />
          </TabsContent>

          {/* Contact Tab - Shared */}
          <TabsContent value="contact" className="space-y-4">
            <PersonalInfo 
              profile={localProfile}
              onEdit={() => setShowContactEditor(true)}
              canEdit={canEdit}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      {canEdit && (
        <>
          <PhotoUploadDialog
            open={showPhotoDialog}
            onOpenChange={setShowPhotoDialog}
            userId={profile.id}
            currentPhotoUrl={localProfile.photo_url}
            userName={localProfile.name}
            onPhotoUpdated={(newUrl) => {
              setLocalProfile({ ...localProfile, photo_url: newUrl });
              handleProfileUpdate();
            }}
          />


          <ContactInfoEditor
            open={showContactEditor}
            onOpenChange={setShowContactEditor}
            profile={localProfile}
            onUpdate={handleProfileUpdate}
          />

          <PreferencesEditor
            open={showPreferencesEditor}
            onOpenChange={setShowPreferencesEditor}
            profile={localProfile}
            onUpdate={handleProfileUpdate}
          />
        </>
      )}
    </div>
  );
}

/**
 * Lightweight profile card for displaying in lists or grids
 */
export function ProfileCard({ profile }: { profile: UserProfile }) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive' as const;
      case 'teacher':
        return 'default' as const;
      case 'student':
        return 'secondary' as const;
      default:
        return 'outline' as const;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'teacher':
        return <GraduationCap className="h-4 w-4" />;
      case 'student':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <UserCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
          {getRoleIcon(profile.role)}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold">{profile.name}</h3>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
        <div className={`px-2 py-1 rounded text-xs font-medium ${getRoleBadgeVariant(profile.role)}`}>
          {profile.role}
        </div>
      </div>
    </div>
  );
}

