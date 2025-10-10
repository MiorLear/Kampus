import React, { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import {
  UserCircle,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Settings,
  Edit,
  Download,
  Share2,
} from 'lucide-react';
import { UserProfile } from '../../../types/user-profiles';
import { formatDate } from '../../../utils/firebase-helpers';

interface ProfileLayoutProps {
  profile: UserProfile;
  children: ReactNode;
  customTabs?: Array<{
    id: string;
    label: string;
    icon: ReactNode;
    content: ReactNode;
  }>;
  onEdit?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

export function ProfileLayout({
  profile,
  children,
  customTabs = [],
  onEdit,
  onExport,
  onShare,
}: ProfileLayoutProps) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar className="h-32 w-32 mb-4">
                <AvatarImage src={profile.photo_url} alt={profile.name} />
                <AvatarFallback className="text-2xl">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${getStatusColor(profile.status)}`} />
                <span className="text-sm text-muted-foreground capitalize">
                  {profile.status}
                </span>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant={getRoleBadgeVariant(profile.role)}>
                      {profile.role.toUpperCase()}
                    </Badge>
                    {profile.email_verified && (
                      <Badge variant="outline" className="bg-green-50">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {onExport && (
                    <Button variant="outline" size="sm" onClick={onExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  )}
                  {onShare && (
                    <Button variant="outline" size="sm" onClick={onShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  )}
                </div>
              </div>

              {/* Quick Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.email}</span>
                </div>
                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Joined {formatDate(profile.created_at)}</span>
                </div>
                {profile.last_login && (
                  <div className="flex items-center gap-2 text-sm">
                    <UserCircle className="h-4 w-4 text-muted-foreground" />
                    <span>Last login {formatDate(profile.last_login)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          <TabsTrigger value="overview">
            <UserCircle className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="personal">
            <UserCircle className="h-4 w-4 mr-2" />
            Personal
          </TabsTrigger>
          <TabsTrigger value="contact">
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </TabsTrigger>
          {customTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.icon}
              {tab.label}
            </TabsTrigger>
          ))}
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {children}
        </TabsContent>

        {customTabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-4">
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

