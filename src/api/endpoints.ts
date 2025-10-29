/**
 * Definición centralizada de endpoints de la API
 * Facilita el mantenimiento y refactoring
 */

export const API_ENDPOINTS = {
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_STATS: '/users/stats',
  
  // Courses
  COURSES: '/courses',
  COURSE_BY_ID: (id: string) => `/courses/${id}`,
  COURSE_MODULES: (courseId: string) => `/modules/courses/${courseId}/modules`,
  
  // Modules
  MODULES: '/modules',
  MODULE_BY_ID: (id: string) => `/modules/${id}`,
  
  // Progress (userId viene del token de autenticación)
  PROGRESS_ACCESS: '/progress/access',
  PROGRESS_SAVE: '/progress',
  PROGRESS_COMPLETE: '/progress/complete',
  PROGRESS_MODULE: (courseId: string, moduleId: string) => 
    `/progress/module/${courseId}/${moduleId}`,
  PROGRESS_COURSE_MODULES: (courseId: string) => 
    `/progress/course/${courseId}`,
  PROGRESS_COURSE_SUMMARY: (courseId: string) => 
    `/progress/course/${courseId}/summary`,
  
  // Enrollments
  ENROLLMENTS: '/enrollments',
  ENROLLMENT_BY_ID: (id: string) => `/enrollments/${id}`,
  ENROLLMENTS_BY_STUDENT: (studentId: string) => `/enrollments?student_id=${studentId}`,
  ENROLLMENTS_BY_COURSE: (courseId: string) => `/enrollments?course_id=${courseId}`,
  
  // Assignments
  ASSIGNMENTS: '/assignments',
  ASSIGNMENT_BY_ID: (id: string) => `/assignments/${id}`,
  ASSIGNMENTS_BY_COURSE: (courseId: string) => `/assignments?course_id=${courseId}`,
  
  // Submissions
  SUBMISSIONS: '/submissions',
  SUBMISSION_BY_ID: (id: string) => `/submissions/${id}`,
  SUBMISSIONS_BY_ASSIGNMENT: (assignmentId: string) => `/submissions?assignment_id=${assignmentId}`,
  SUBMISSIONS_BY_STUDENT: (studentId: string) => `/submissions?student_id=${studentId}`,
  
  // Analytics
  ANALYTICS_STUDENT: (studentId: string) => `/analytics/student/${studentId}`,
  ANALYTICS_TEACHER: (teacherId: string) => `/analytics/teacher/${teacherId}`,
  ANALYTICS_COURSE: (courseId: string) => `/analytics/course/${courseId}`,
  ANALYTICS_SYSTEM: '/analytics/system',
} as const;


