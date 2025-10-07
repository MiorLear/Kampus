import React, { useState, useRef } from 'react';
import { ErrorBoundary } from '../ErrorBoundary';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { 
  User, 
  Mail, 
  Calendar, 
  GraduationCap, 
  Users, 
  Camera, 
  Save, 
  Edit, 
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'student';
  career: string;
  cohort: string;
  enrollmentDate: string;
  lastLogin: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  preferences: {
    emailNotifications: boolean;
    courseUpdates: boolean;
    gradeNotifications: boolean;
    marketingEmails: boolean;
  };
}

interface ProfilePageProps {
  user: UserProfile;
  onUpdateProfile?: (updates: Partial<UserProfile>) => Promise<void>;
  onUpdatePassword?: (currentPassword: string, newPassword: string) => Promise<void>;
  onBack?: () => void;
}

const mockUser: UserProfile = {
  id: 'user1',
  email: 'student@example.com',
  displayName: 'John Doe',
  photoURL: undefined,
  role: 'student',
  career: 'Computer Science',
  cohort: '2024 Spring',
  enrollmentDate: '2024-01-15',
  lastLogin: '2024-01-25T10:30:00Z',
  bio: 'Passionate about web development and learning new technologies.',
  phone: '+1 (555) 123-4567',
  dateOfBirth: '2000-05-15',
  preferences: {
    emailNotifications: true,
    courseUpdates: true,
    gradeNotifications: true,
    marketingEmails: false
  }
};

const careerOptions = [
  'Computer Science',
  'Software Engineering',
  'Information Technology',
  'Data Science',
  'Cybersecurity',
  'Web Development',
  'Mobile Development',
  'Game Development',
  'Artificial Intelligence',
  'Other'
];

const cohortOptions = [
  '2024 Spring',
  '2024 Summer',
  '2024 Fall',
  '2023 Spring',
  '2023 Summer',
  '2023 Fall',
  '2022 Spring',
  '2022 Summer',
  '2022 Fall'
];

export function ProfilePage({ user = mockUser, onUpdateProfile, onUpdatePassword, onBack }: ProfilePageProps) {
  // Validar que el objeto user tenga todas las propiedades requeridas
  const safeUser: UserProfile = {
    id: user?.id || mockUser.id,
    email: user?.email || mockUser.email,
    displayName: user?.displayName || mockUser.displayName,
    photoURL: user?.photoURL || mockUser.photoURL,
    role: user?.role || mockUser.role,
    career: user?.career || mockUser.career,
    cohort: user?.cohort || mockUser.cohort,
    enrollmentDate: user?.enrollmentDate || mockUser.enrollmentDate,
    lastLogin: user?.lastLogin || mockUser.lastLogin,
    bio: user?.bio || mockUser.bio,
    phone: user?.phone || mockUser.phone,
    dateOfBirth: user?.dateOfBirth || mockUser.dateOfBirth,
    preferences: user?.preferences || mockUser.preferences
  };

  const [profile, setProfile] = useState<UserProfile>(safeUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar datos guardados del localStorage
  const loadSavedProfile = () => {
    try {
      const savedProfile = localStorage.getItem(`user-profile-${profile.id}`);
      if (savedProfile) {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(prev => ({ ...prev, ...parsedProfile }));
      }
    } catch (error) {
      console.error('Error loading saved profile:', error);
    }
  };

  // Guardar datos en localStorage
  const saveProfileToStorage = (profileData: UserProfile) => {
    try {
      localStorage.setItem(`user-profile-${profileData.id}`, JSON.stringify(profileData));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  // Cargar datos al inicializar
  React.useEffect(() => {
    loadSavedProfile();
  }, [profile.id]);

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setAutoSaveStatus('saving');
    setProfile(prev => {
      const updatedProfile = { ...prev, [field]: value };
      // Auto-guardar cambios en localStorage
      saveProfileToStorage(updatedProfile);
      return updatedProfile;
    });
    
    // Mostrar estado de guardado
    setTimeout(() => {
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 2000);
    }, 500);
  };

  const handlePreferenceChange = (preference: keyof UserProfile['preferences'], value: boolean) => {
    setProfile(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [preference]: value }
    }));
  };

  const handleSave = async () => {
    if (isSaving) return;

    setIsSaving(true);
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validate required fields
      if (!profile.displayName.trim()) {
        throw new Error('Display name is required');
      }
      if (profile.displayName.length > 50) {
        throw new Error('Display name must be 50 characters or less');
      }
      if (profile.bio && profile.bio.length > 500) {
        throw new Error('Bio must be 500 characters or less');
      }

      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call parent update function
      if (onUpdateProfile) {
        await onUpdateProfile(profile);
      }

      // Guardar en localStorage
      saveProfileToStorage(profile);

      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setProfile(user);
    setIsEditing(false);
    setError(null);
    setSuccess(null);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Photo must be 5MB or smaller');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setProfile(prev => ({ ...prev, photoURL: result }));
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordUpdate = async () => {
    if (isSaving) return;

    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    // Validar contraseña actual contra la almacenada (simulado)
    const storedPassword = localStorage.getItem(`user-password-${profile.id}`) || 'defaultPassword123';
    if (passwordData.currentPassword !== storedPassword) {
      setError('Current password is incorrect');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      if (onUpdatePassword) {
        await onUpdatePassword(passwordData.currentPassword, passwordData.newPassword);
      }

      // Guardar nueva contraseña en localStorage (simulado)
      localStorage.setItem(`user-password-${profile.id}`, passwordData.newPassword);

      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccess('Password updated successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name || typeof name !== 'string') return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Error boundary para prevenir crashes
  const handleError = (error: Error, errorInfo: any) => {
    console.error('ProfilePage Error:', error, errorInfo);
    setError('An unexpected error occurred. Please try again.');
  };

  // Validar que el componente se renderice correctamente
  if (!profile) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Loading Error</h2>
          <p className="text-muted-foreground">Unable to load profile data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button 
                variant="ghost" 
                onClick={onBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">Profile Settings</h1>
              <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
            </div>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving || isLoading}>
                {isSaving || isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLoading ? 'Processing...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Auto-save indicator */}
        {isEditing && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Changes are automatically saved as you type. Click "Save Changes" to confirm your updates.
            </AlertDescription>
          </Alert>
        )}

        {/* Auto-save status indicator */}
        {autoSaveStatus && (
          <div className="fixed top-4 right-4 z-50">
            <Alert className={`w-64 ${autoSaveStatus === 'saved' ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
              {autoSaveStatus === 'saved' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
              )}
              <AlertDescription className={autoSaveStatus === 'saved' ? 'text-green-800' : 'text-yellow-800'}>
                {autoSaveStatus === 'saved' ? 'Changes saved automatically' : 'Saving changes...'}
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Photo */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>Upload a photo to personalize your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.photoURL} alt={profile?.displayName || 'User'} />
                    <AvatarFallback className="text-lg">
                      {getInitials(profile?.displayName || 'User')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!isEditing}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      {profile.photoURL ? 'Change Photo' : 'Upload Photo'}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name *</Label>
                    <Input
                      id="displayName"
                      value={profile?.displayName || ''}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      disabled={!isEditing}
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      {(profile?.displayName || '').length}/50 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={profile?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile?.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={profile?.dateOfBirth || ''}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile?.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    maxLength={500}
                    className="min-h-20"
                  />
                  <p className="text-xs text-muted-foreground">
                    {(profile?.bio || '').length}/500 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Academic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>Your academic details and enrollment information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="career">Career/Program</Label>
                    <Select
                      value={profile?.career || ''}
                      onValueChange={(value) => handleInputChange('career', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your career" />
                      </SelectTrigger>
                      <SelectContent>
                        {careerOptions.map(career => (
                          <SelectItem key={career} value={career}>
                            {career}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cohort">Cohort</Label>
                    <Select
                      value={profile?.cohort || ''}
                      onValueChange={(value) => handleInputChange('cohort', value)}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your cohort" />
                      </SelectTrigger>
                      <SelectContent>
                        {cohortOptions.map(cohort => (
                          <SelectItem key={cohort} value={cohort}>
                            {cohort}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Enrolled: {profile?.enrollmentDate ? new Date(profile.enrollmentDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Last login: {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Security */}
            <Card>
              <CardHeader>
                <CardTitle>Account Security</CardTitle>
                <CardDescription>Manage your password and security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                >
                  Change Password
                </Button>

                {showPasswordForm && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={handlePasswordUpdate}
                        disabled={isSaving || isLoading}
                        className="flex-1"
                      >
                        {isSaving || isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">General account notifications</p>
                    </div>
                    <input
                      id="emailNotifications"
                      type="checkbox"
                      checked={profile?.preferences?.emailNotifications || false}
                      onChange={(e) => handlePreferenceChange('emailNotifications', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="courseUpdates">Course Updates</Label>
                      <p className="text-xs text-muted-foreground">New content and announcements</p>
                    </div>
                    <input
                      id="courseUpdates"
                      type="checkbox"
                      checked={profile?.preferences?.courseUpdates || false}
                      onChange={(e) => handlePreferenceChange('courseUpdates', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="gradeNotifications">Grade Notifications</Label>
                      <p className="text-xs text-muted-foreground">When grades are posted</p>
                    </div>
                    <input
                      id="gradeNotifications"
                      type="checkbox"
                      checked={profile?.preferences?.gradeNotifications || false}
                      onChange={(e) => handlePreferenceChange('gradeNotifications', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails">Marketing Emails</Label>
                      <p className="text-xs text-muted-foreground">Promotional content and offers</p>
                    </div>
                    <input
                      id="marketingEmails"
                      type="checkbox"
                      checked={profile?.preferences?.marketingEmails || false}
                      onChange={(e) => handlePreferenceChange('marketingEmails', e.target.checked)}
                      disabled={!isEditing}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Status</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Role</span>
                  <Badge variant="outline">{profile?.role || 'student'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Member Since</span>
                  <span className="text-sm text-muted-foreground">
                    {profile?.enrollmentDate ? new Date(profile.enrollmentDate).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
