import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import { User, Course } from './firestore.service';

/**
 * Servicio API que reemplaza las llamadas directas a Firestore
 * Todas las operaciones ahora pasan por el backend
 */
export class ApiService {
  // ========== USERS ==========

  static async getUser(userId: string): Promise<User | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.USER_BY_ID(userId));
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async getAllUsers(role?: string): Promise<User[]> {
    try {
      const params = role ? { role } : {};
      const response = await apiClient.get(API_ENDPOINTS.USERS, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getUsersByRole(role: 'student' | 'teacher' | 'admin'): Promise<User[]> {
    return this.getAllUsers(role);
  }

  static async updateUser(userId: string, data: Partial<User>): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_BY_ID(userId), data);
  }

  static async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.USER_BY_ID(userId));
  }

  static async getUserStats() {
    const response = await apiClient.get(API_ENDPOINTS.USER_STATS);
    return response.data;
  }

  // ========== COURSES ==========

  static async getAllCourses(teacherId?: string): Promise<Course[]> {
    try {
      const params = teacherId ? { teacher_id: teacherId } : {};
      const response = await apiClient.get(API_ENDPOINTS.COURSES, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getCourse(courseId: string): Promise<Course | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COURSE_BY_ID(courseId));
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async createCourse(course: Omit<Course, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.COURSES, course);
    return response.data.id;
  }

  static async updateCourse(courseId: string, updates: Partial<Course>): Promise<void> {
    await apiClient.put(API_ENDPOINTS.COURSE_BY_ID(courseId), updates);
  }

  static async deleteCourse(courseId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.COURSE_BY_ID(courseId));
  }

  // ========== MODULES ==========

  static async getCourseModules(courseId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COURSE_MODULES(courseId));
      // Ensure we always return an array, even if API returns null/undefined
      if (!response.data) {
        return [];
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // If it's not an array, return empty array
      console.warn('API returned non-array data for modules:', response.data);
      return [];
    } catch (error: any) {
      // If 404 or empty response, return empty array instead of throwing
      if (error.response?.status === 404) {
        return [];
      }
      // For other errors, log and return empty array to prevent crashes
      console.warn('Error fetching course modules:', error);
      return [];
    }
  }

  static async getModule(moduleId: string): Promise<any | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MODULE_BY_ID(moduleId));
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async createModule(courseId: string, module: any): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.COURSE_MODULES(courseId), module);
    return response.data.id;
  }

  static async updateModule(moduleId: string, updates: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.MODULE_BY_ID(moduleId), updates);
  }

  static async deleteModule(moduleId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.MODULE_BY_ID(moduleId));
  }

  // ========== PROGRESS ==========

  static async saveModuleAccess(
    userId: string,
    courseId: string,
    moduleId: string,
    progressPercentage?: number
  ): Promise<void> {
    // TODO: Get userId from token once auth middleware is implemented
    await apiClient.post(API_ENDPOINTS.PROGRESS_ACCESS, {
      userId,
      courseId,
      moduleId,
      progressPercentage
    });
  }

  static async saveModuleProgress(
    userId: string,
    courseId: string,
    moduleId: string,
    progressData: {
      progress_percentage?: number;
      video_time_watched?: number;
      video_duration?: number;
      time_spent?: number;
    }
  ): Promise<void> {
    // TODO: Get userId from token once auth middleware is implemented
    await apiClient.post(API_ENDPOINTS.PROGRESS_SAVE, {
      userId,
      courseId,
      moduleId,
      progressData
    });
  }

  static async markModuleComplete(
    userId: string,
    courseId: string,
    moduleId: string
  ): Promise<void> {
    // TODO: Get userId from token once auth middleware is implemented
    await apiClient.post(API_ENDPOINTS.PROGRESS_COMPLETE, {
      userId,
      courseId,
      moduleId
    });
  }

  static async getUserProgressForCourse(
    userId: string,
    courseId: string
  ): Promise<any[]> {
    try {
      // TODO: Get userId from token once auth middleware is implemented
      const response = await apiClient.get(API_ENDPOINTS.PROGRESS_COURSE_MODULES(courseId), {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getCourseProgress(
    userId: string,
    courseId: string
  ): Promise<any | null> {
    try {
      // TODO: Get userId from token once auth middleware is implemented
      const response = await apiClient.get(API_ENDPOINTS.PROGRESS_COURSE_SUMMARY(courseId), {
        params: { userId }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // ========== ENROLLMENTS ==========

  static async getEnrollmentsByStudent(studentId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ENROLLMENTS, {
        params: { student_id: studentId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getEnrollmentsByCourse(courseId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ENROLLMENTS, {
        params: { course_id: courseId }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAllEnrollments(): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ENROLLMENTS);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  static async enrollStudent(data: { student_id: string; course_id: string; progress?: number }): Promise<string> {
    try {
      const payload = {
        student_id: data.student_id,  // TODO: Extraer del token cuando se implemente middleware de auth en backend Python
        course_id: data.course_id,
        progress: data.progress || 0
      };
      console.log('[ApiService] Enrolling student - Payload:', payload);
      console.log('[ApiService] Endpoint:', API_ENDPOINTS.ENROLLMENTS);

      const response = await apiClient.post(API_ENDPOINTS.ENROLLMENTS, payload);
      console.log('[ApiService] Enrollment successful - Response:', response.data);
      return response.data.id;
    } catch (error: any) {
      console.error('[ApiService] Enrollment error:', error);
      console.error('[ApiService] Error response:', error?.response?.data);
      throw error;
    }
  }

  static async unenrollStudent(enrollmentId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ENROLLMENT_BY_ID(enrollmentId));
  }

  // ========== ASSIGNMENTS ==========

  static async getAssignmentsByCourse(courseId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS_BY_COURSE(courseId));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAllAssignments(): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENTS);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  static async getAssignment(assignmentId: string): Promise<any | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ASSIGNMENT_BY_ID(assignmentId));
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async createAssignment(assignment: any): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.ASSIGNMENTS, assignment);
    return response.data.id;
  }

  static async updateAssignment(assignmentId: string, updates: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.ASSIGNMENT_BY_ID(assignmentId), updates);
  }

  static async deleteAssignment(assignmentId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ASSIGNMENT_BY_ID(assignmentId));
  }

  // ========== SUBMISSIONS ==========

  static async getAllSubmissions(): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBMISSIONS);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  static async getSubmissionsByAssignment(assignmentId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBMISSIONS_BY_ASSIGNMENT(assignmentId));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getSubmissionsByStudent(studentId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBMISSIONS_BY_STUDENT(studentId));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getSubmission(submissionId: string): Promise<any | null> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.SUBMISSION_BY_ID(submissionId));
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async createSubmission(submission: any): Promise<string> {
    const response = await apiClient.post(API_ENDPOINTS.SUBMISSIONS, submission);
    return response.data.id;
  }

  static async updateSubmission(submissionId: string, updates: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.SUBMISSION_BY_ID(submissionId), updates);
  }

  static async deleteSubmission(submissionId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SUBMISSION_BY_ID(submissionId));
  }

  static async submitAssignment(assignmentId: string, submissionData: { answers: any; student_id: string }): Promise<void> {
    const payload = {
      assignment_id: assignmentId,
      student_id: submissionData.student_id,
      answers: submissionData.answers,
      submitted_at: new Date().toISOString()
    };
    await apiClient.post(API_ENDPOINTS.SUBMISSIONS, payload);
  }

  // ========== ANNOUNCEMENTS ==========

  static async getAnnouncementsByCourse(courseId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/announcements?course_id=${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAnnouncement(announcementId: string): Promise<any | null> {
    try {
      const response = await apiClient.get(`/announcements/${announcementId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async createAnnouncement(announcement: any): Promise<string> {
    const response = await apiClient.post('/announcements', announcement);
    return response.data.id;
  }

  static async updateAnnouncement(announcementId: string, updates: any): Promise<void> {
    await apiClient.put(`/announcements/${announcementId}`, updates);
  }

  static async deleteAnnouncement(announcementId: string): Promise<void> {
    await apiClient.delete(`/announcements/${announcementId}`);
  }

  // ========== MESSAGES ==========

  static async getMessagesBetweenUsers(userId: string, otherUserId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/messages?user_id=${userId}&other_user_id=${otherUserId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getAllMessages(): Promise<any[]> {
    try {
      const response = await apiClient.get(`/messages`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  static async getReceivedMessages(userId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/messages?recipient_id=${userId}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  static async getSentMessages(userId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/messages?sender_id=${userId}`);
      return response.data || [];
    } catch (error) {
      return [];
    }
  }

  static async markMessageAsRead(messageId: string): Promise<void> {
    await apiClient.put(`/messages/${messageId}`, { read: true });
  }

  static async getAllActivityLogs(limit?: number): Promise<any[]> {
    try {
      const params = limit ? { limit } : {};
      const response = await apiClient.get(`/activity-logs`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getMessage(messageId: string): Promise<any | null> {
    try {
      const response = await apiClient.get(`/messages/${messageId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  static async createMessage(message: any): Promise<string> {
    const response = await apiClient.post('/messages', message);
    return response.data.id;
  }

  static async updateMessage(messageId: string, updates: any): Promise<void> {
    await apiClient.put(`/messages/${messageId}`, updates);
  }

  static async deleteMessage(messageId: string): Promise<void> {
    await apiClient.delete(`/messages/${messageId}`);
  }

  // ========== ANALYTICS ==========

  static async getStudentAnalytics(studentId: string): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS_STUDENT(studentId));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getTeacherAnalytics(teacherId: string): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS_TEACHER(teacherId));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getCourseAnalytics(courseId: string): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS_COURSE(courseId));
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  static async getSystemAnalytics(): Promise<any> {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ANALYTICS_SYSTEM);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // ========== USER PROFILES ==========

  static async createUserProfile(userId: string, profileData: any): Promise<any> {
    const response = await apiClient.post(API_ENDPOINTS.USER_PROFILE_CREATE(userId), profileData);
    return response.data;
  }

  static async updateStudentProfile(userId: string, updates: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_PROFILE_STUDENT(userId), updates);
  }

  static async updateTeacherProfile(userId: string, updates: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_PROFILE_TEACHER(userId), updates);
  }

  static async updateAdminProfile(userId: string, updates: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_PROFILE_ADMIN(userId), updates);
  }

  static async updateStudentStats(userId: string, stats: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_STATS_STUDENT(userId), stats);
  }

  static async updateTeacherStats(userId: string, stats: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_STATS_TEACHER(userId), stats);
  }

  static async updateAdminStats(userId: string, stats: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_STATS_ADMIN(userId), stats);
  }

  static async updateAdminPermissions(userId: string, permissions: any): Promise<void> {
    await apiClient.put(API_ENDPOINTS.USER_PERMISSIONS(userId), permissions);
  }
}


