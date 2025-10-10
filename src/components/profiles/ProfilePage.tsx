import React, { useEffect, useState } from 'react';
import { ProfileRouter } from './ProfileRouter';
import { UserProfileService } from '../../services/user-profile.service';
import { UserProfile } from '../../types/user-profiles';
import { Card, CardContent } from '../ui/card';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { toast } from 'sonner';

interface ProfilePageProps {
  userId: string;
  currentUserId?: string; // For permission checks
}

export function ProfilePage({ userId, currentUserId }: ProfilePageProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userProfile = await UserProfileService.getUserProfile(userId);
      
      if (!userProfile) {
        setError('Profile not found');
        return;
      }

      setProfile(userProfile);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    toast.info('Edit functionality coming soon!');
    // TODO: Navigate to edit page or open edit modal
  };

  const handleExport = () => {
    if (!profile) return;
    
    // Export profile as JSON
    const dataStr = JSON.stringify(profile, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profile-${profile.name.replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Profile exported successfully!');
  };

  const handleShare = () => {
    if (!profile) return;
    
    // Copy profile URL to clipboard
    const url = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(url);
    toast.success('Profile link copied to clipboard!');
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error State
  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-destructive">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <p className="text-center text-destructive">{error || 'Profile not found'}</p>
              <Button variant="outline" onClick={loadProfile}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Profile View
  const canEdit = currentUserId === userId; // Only owner can edit (can be extended with admin permission)

  return (
    <ProfileRouter
      profile={profile}
      onEdit={canEdit ? handleEdit : undefined}
      onExport={handleExport}
      onShare={handleShare}
      canEdit={canEdit}
      onProfileUpdate={loadProfile}
    />
  );
}

