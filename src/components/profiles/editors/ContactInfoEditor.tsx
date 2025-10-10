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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { UserProfile } from '../../../types/user-profiles';
import { UserProfileService } from '../../../services/user-profile.service';

interface ContactInfoEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserProfile;
  onUpdate?: () => void;
}

export function ContactInfoEditor({
  open,
  onOpenChange,
  profile,
  onUpdate,
}: ContactInfoEditorProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    email: profile.email || '',
    phone: profile.phone || '',
    address: {
      street: profile.address?.street || '',
      city: profile.address?.city || '',
      state: profile.address?.state || '',
      country: profile.address?.country || '',
      postal_code: profile.address?.postal_code || '',
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleClearAddress = () => {
    setFormData((prev) => ({
      ...prev,
      address: {
        street: '',
        city: '',
        state: '',
        country: '',
        postal_code: '',
      },
    }));
  };

  const handleSave = async () => {
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    setSaving(true);

    try {
      // Build update data - only include fields with values
      const updateData: any = {
        email: formData.email,
      };

      // Only add phone if it has a value
      if (formData.phone.trim()) {
        updateData.phone = formData.phone;
      }

      // Only add address if it has any values
      const hasAddress = Object.values(formData.address).some((val) => val.trim());
      if (hasAddress) {
        // Only include address fields that have values
        const addressData: any = {};
        if (formData.address.street.trim()) addressData.street = formData.address.street;
        if (formData.address.city.trim()) addressData.city = formData.address.city;
        if (formData.address.state.trim()) addressData.state = formData.address.state;
        if (formData.address.country.trim()) addressData.country = formData.address.country;
        if (formData.address.postal_code.trim()) addressData.postal_code = formData.address.postal_code;
        
        if (Object.keys(addressData).length > 0) {
          updateData.address = addressData;
        }
      }

      if (profile.role === 'student') {
        await UserProfileService.updateStudentProfile(profile.id, updateData);
      } else if (profile.role === 'teacher') {
        await UserProfileService.updateTeacherProfile(profile.id, updateData);
      } else if (profile.role === 'admin') {
        await UserProfileService.updateAdminProfile(profile.id, updateData);
      }

      toast.success('Contact information updated successfully!');
      onUpdate?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating contact info:', error);
      toast.error('Failed to update contact information');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Contact Information</DialogTitle>
          <DialogDescription>Update your contact details and address</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@example.com"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              Changing your email may affect your login credentials
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Phone</Label>
            <Input
              id="contact-phone"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={saving}
            />
          </div>

          {/* Address Section */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Address</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAddress}
                disabled={saving}
                className="h-6 text-xs"
              >
                Clear All
              </Button>
            </div>

            {/* Street */}
            <div className="space-y-2">
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                placeholder="123 Main St"
                disabled={saving}
              />
            </div>

            {/* City & State */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  placeholder="New York"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  placeholder="NY"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Country & Postal Code */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  placeholder="United States"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal">Postal Code</Label>
                <Input
                  id="postal"
                  value={formData.address.postal_code}
                  onChange={(e) => handleAddressChange('postal_code', e.target.value)}
                  placeholder="10001"
                  disabled={saving}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.email.trim()}>
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

