import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import {
  GraduationCap,
  BookOpen,
  Users,
  FileText,
  Star,
  Award,
  Clock,
  MapPin,
  FileSearch,
} from 'lucide-react';
import { TeacherProfile } from '../../../types/user-profiles';
import { formatDate } from '../../../utils/firebase-helpers';

interface TeacherExtensionsProps {
  profile: TeacherProfile;
}

export function TeacherOverview({ profile }: TeacherExtensionsProps) {
  const stats = profile.stats || {
    total_courses_taught: 0,
    total_students_taught: 0,
    total_assignments_created: 0,
    total_assignments_graded: 0,
    pending_grading: 0,
  };

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses Taught
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total_courses_taught}</div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Students Taught
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.total_students_taught}</div>
              <Users className="h-8 w-8 text-green-600" />
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
                <div className="text-2xl font-bold">{stats.total_assignments_graded}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pending_grading} pending
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {stats.average_student_rating?.toFixed(1) || 'N/A'}
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
            {stats.average_student_rating && (
              <p className="text-xs text-muted-foreground">out of 5.0</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Professional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>Teaching credentials and position</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.employee_id && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                <p className="text-sm mt-1 font-mono">{profile.employee_id}</p>
              </div>
            )}
            {profile.department && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Department</label>
                <p className="text-sm mt-1">{profile.department}</p>
              </div>
            )}
            {profile.position && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Position</label>
                <p className="text-sm mt-1">{profile.position}</p>
              </div>
            )}
            {profile.hire_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Hire Date</label>
                <p className="text-sm mt-1">{formatDate(profile.hire_date)}</p>
              </div>
            )}
            {profile.office_location && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Office Location
                </label>
                <p className="text-sm mt-1">{profile.office_location}</p>
              </div>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground">Biography</label>
              <p className="text-sm mt-2 leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Specializations */}
          {profile.specializations && profile.specializations.length > 0 && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Specializations
              </label>
              <div className="flex flex-wrap gap-2">
                {profile.specializations.map((spec, index) => (
                  <Badge key={index} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Subjects Taught */}
          {profile.subjects_taught && profile.subjects_taught.length > 0 && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Subjects Taught
              </label>
              <div className="flex flex-wrap gap-2">
                {profile.subjects_taught.map((subject, index) => (
                  <Badge key={index} variant="outline">
                    {subject}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      {profile.education && profile.education.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Education
            </CardTitle>
            <CardDescription>Academic background and degrees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.education.map((edu, index) => (
                <div key={index} className="border-l-2 border-primary pl-4">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-sm">{edu.field_of_study}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Graduated: {edu.graduation_year}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certifications */}
      {profile.certifications && profile.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
            <CardDescription>Professional certifications and credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.certifications.map((cert, index) => (
                <div key={index} className="border-l-2 border-green-500 pl-4">
                  <h4 className="font-medium">{cert.name}</h4>
                  <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-muted-foreground">
                      Obtained: {formatDate(cert.date_obtained)}
                    </p>
                    {cert.expiry_date && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">
                          Expires: {formatDate(cert.expiry_date)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Office Hours */}
      {profile.office_hours && profile.office_hours.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Office Hours
            </CardTitle>
            <CardDescription>Available times for student consultations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profile.office_hours.map((hours, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted"
                >
                  <span className="font-medium">{hours.day}</span>
                  <span className="text-sm text-muted-foreground">
                    {hours.start_time} - {hours.end_time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research */}
      {profile.research && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Research
            </CardTitle>
            <CardDescription>Research areas and publications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.research.areas && profile.research.areas.length > 0 && (
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Research Areas
                </label>
                <div className="flex flex-wrap gap-2">
                  {profile.research.areas.map((area, index) => (
                    <Badge key={index} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {profile.research.publications && profile.research.publications.length > 0 && (
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-muted-foreground mb-3 block">
                  Publications
                </label>
                <div className="space-y-3">
                  {profile.research.publications.map((pub, index) => (
                    <div key={index} className="border-l-2 border-blue-500 pl-4">
                      <h4 className="font-medium text-sm">{pub.title}</h4>
                      {pub.journal && (
                        <p className="text-sm text-muted-foreground italic">{pub.journal}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">Year: {pub.year}</p>
                        {pub.url && (
                          <a
                            href={pub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Publication →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

