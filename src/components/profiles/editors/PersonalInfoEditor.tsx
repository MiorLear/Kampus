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
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile } from '../../../types/user-profiles';
import { UserProfileService } from '../../../services/user-profile.service';

interface PersonalInfoEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onUpdate?: () => void;
}

export function PersonalInfoEditor({
  open,
  onOpenChange,
  profile,
  onUpdate,
}: PersonalInfoEditorProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name || '',
    phone: profile.phone || '',
    date_of_birth: profile.date_of_birth || '',
    gender: profile.gender || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setSaving(true);

    try {
      // Update based on role - only include fields with values
      const updateData: any = {
        name: formData.name,
      };

      // Only add fields that have values (not empty strings)
      if (formData.phone.trim()) {
        updateData.phone = formData.phone;
      }
      if (formData.date_of_birth.trim()) {
        updateData.date_of_birth = formData.date_of_birth;
      }
      if (formData.gender.trim()) {
        updateData.gender = formData.gender;
      }

      if (profile.role === 'student') {
        await UserProfileService.updateStudentProfile(profile.id, updateData);
      } else if (profile.role === 'teacher') {
        await UserProfileService.updateTeacherProfile(profile.id, updateData);
      } else if (profile.role === 'admin') {
        await UserProfileService.updateAdminProfile(profile.id, updateData);
      }

      toast.success('Personal information updated successfully!');
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast.error('Failed to update personal information');
    } finally {
      setSaving(false);
    }
  };

  const handleClearField = (field: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
          <DialogDescription>
            Update your personal details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="John Doe"
              disabled={saving}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="phone">Phone</Label>
              {formData.phone && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearField('phone')}
                  disabled={saving}
                  className="h-6 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={saving}
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="dob">Date of Birth</Label>
              {formData.date_of_birth && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearField('date_of_birth')}
                  disabled={saving}
                  className="h-6 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <Input
              id="dob"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleChange('date_of_birth', e.target.value)}
              disabled={saving}
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="gender">Gender</Label>
              {formData.gender && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleClearField('gender')}
                  disabled={saving}
                  className="h-6 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleChange('gender', value)}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

