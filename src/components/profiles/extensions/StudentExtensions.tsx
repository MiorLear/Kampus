import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import {
  GraduationCap,
  BookOpen,
  FileText,
  TrendingUp,
  Calendar,
  Target,
  Heart,
  Eye,
  Brain,
} from 'lucide-react';
import { StudentProfile } from '../../../types/user-profiles';

interface StudentExtensionsProps {
  profile: StudentProfile;
}

export function StudentOverview({ profile }: StudentExtensionsProps) {
  const stats = profile.stats || {
    total_courses_enrolled: 0,
    total_courses_completed: 0,
    average_grade: 0,
    total_assignments_submitted: 0,
    total_assignments_pending: 0,
  };

  const completionRate =
    stats.total_courses_enrolled > 0
      ? Math.round((stats.total_courses_completed / stats.total_courses_enrolled) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total_courses_enrolled}</div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total_courses_completed}</div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={completionRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{completionRate}% complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Grade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.average_grade.toFixed(1)}%</div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assignments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.total_assignments_submitted}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.total_assignments_pending} pending
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Academic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
          <CardDescription>Student academic details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.student_id && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Student ID</label>
                <p className="text-sm mt-1 font-mono">{profile.student_id}</p>
              </div>
            )}
            {profile.program && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Program</label>
                <p className="text-sm mt-1">{profile.program}</p>
              </div>
            )}
            {profile.semester && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Semester</label>
                <p className="text-sm mt-1">Semester {profile.semester}</p>
              </div>
            )}
            {profile.enrollment_year && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Enrollment Year
                </label>
                <p className="text-sm mt-1">{profile.enrollment_year}</p>
              </div>
            )}
            {profile.expected_graduation && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Expected Graduation
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{profile.expected_graduation}</p>
                </div>
              </div>
            )}
            {profile.academic_level && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Academic Level
                </label>
                <Badge variant="outline" className="mt-1 capitalize">
                  {profile.academic_level}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Preferences */}
      {(profile.learning_style || profile.interests || profile.goals) && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Preferences</CardTitle>
            <CardDescription>Personal learning style and interests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.learning_style && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Learning Style
                </label>
                <Badge variant="secondary" className="mt-1 capitalize">
                  {(profile.learning_style || '').replace(/_/g, ' ')}
                </Badge>
              </div>
            )}
            {profile.interests && profile.interests.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Heart className="h-4 w-4" />
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {profile.goals && profile.goals.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4" />
                  Goals
                </label>
                <ul className="list-disc list-inside space-y-1">
                  {profile.goals.map((goal, index) => (
                    <li key={index} className="text-sm">
                      {goal}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Emergency Contact */}
      {profile.emergency_contact && (
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>Contact person in case of emergency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm mt-1">{profile.emergency_contact.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                <p className="text-sm mt-1">{profile.emergency_contact.relationship}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-sm mt-1">{profile.emergency_contact.phone}</p>
              </div>
              {profile.emergency_contact.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-sm mt-1">{profile.emergency_contact.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility Needs */}
      {profile.accessibility_needs && (
        <Card>
          <CardHeader>
            <CardTitle>Accessibility</CardTitle>
            <CardDescription>Special accessibility requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.accessibility_needs.requires_captions && (
                <Badge variant="outline">Requires Captions</Badge>
              )}
              {profile.accessibility_needs.requires_screen_reader && (
                <Badge variant="outline">Requires Screen Reader</Badge>
              )}
              {profile.accessibility_needs.color_blind_mode && (
                <Badge variant="outline">Color Blind Mode</Badge>
              )}
              {profile.accessibility_needs.other && (
                <p className="text-sm mt-2">{profile.accessibility_needs.other}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

