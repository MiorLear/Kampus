import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../ui/card';
import { Badge } from '../../../ui/badge';
import { Button } from '../../../ui/button';
import { Calendar, MapPin, User, Cake, Edit } from 'lucide-react';
import { UserProfile } from '../../../../types/user-profiles';
import { formatDate } from '../../../../utils/firebase-helpers';

interface PersonalInfoProps {
  profile: UserProfile;
  onEdit?: () => void;
  canEdit?: boolean;
}

export function PersonalInfo({ profile, onEdit, canEdit }: PersonalInfoProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Basic personal details</CardDescription>
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
          {/* Full Name */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Full Name</label>
            <div className="flex items-center gap-2 mt-1">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{profile.name}</p>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm">{profile.email}</p>
              {profile.email_verified && (
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Verified
                </Badge>
              )}
            </div>
          </div>

          {/* Phone */}
          {profile.phone && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-sm mt-1">{profile.phone}</p>
            </div>
          )}

          {/* Date of Birth */}
          {profile.date_of_birth && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
              <div className="flex items-center gap-2 mt-1">
                <Cake className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{formatDate(profile.date_of_birth)}</p>
              </div>
            </div>
          )}

          {/* Gender */}
          {profile.gender && (
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p className="text-sm mt-1 capitalize">{(profile.gender || '').replace(/_/g, ' ')}</p>
            </div>
          )}

          {/* Member Since */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Member Since</label>
            <div className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm">{formatDate(profile.created_at)}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        {profile.address && (
          <div className="pt-4 border-t">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4" />
              Address
            </label>
            <div className="text-sm space-y-1">
              {profile.address.street && <p>{profile.address.street}</p>}
              <p>
                {[
                  profile.address.city,
                  profile.address.state,
                  profile.address.postal_code,
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              {profile.address.country && <p>{profile.address.country}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

