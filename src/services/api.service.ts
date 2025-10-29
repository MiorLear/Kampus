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
      return response.data;
    } catch (error) {
      throw error;
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

  // ========== PROGRESS ==========
  
  static async saveModuleAccess(
    userId: string,
    courseId: string,
    moduleId: string,
    progressPercentage?: number
  ): Promise<void> {
    // userId no se envía, viene del token de autenticación
    await apiClient.post(API_ENDPOINTS.PROGRESS_ACCESS, {
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
    // userId no se envía, viene del token de autenticación
    await apiClient.post(API_ENDPOINTS.PROGRESS_SAVE, {
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
    // userId no se envía, viene del token de autenticación
    await apiClient.post(API_ENDPOINTS.PROGRESS_COMPLETE, {
      courseId,
      moduleId
    });
  }

  static async getUserProgressForCourse(
    userId: string,
    courseId: string
  ): Promise<any[]> {
    try {
      // userId no se envía en la URL, viene del token
      const response = await apiClient.get(API_ENDPOINTS.PROGRESS_COURSE_MODULES(courseId));
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
      // userId no se envía en la URL, viene del token
      const response = await apiClient.get(API_ENDPOINTS.PROGRESS_COURSE_SUMMARY(courseId));
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

  static async enrollStudent(data: { student_id: string; course_id: string; progress?: number }): Promise<string> {
    try {
      // student_id viene del token, no se envía
      const response = await apiClient.post(API_ENDPOINTS.ENROLLMENTS, {
        course_id: data.course_id,
        progress: data.progress || 0
      });
      return response.data.id;
    } catch (error) {
      throw error;
    }
  }

  static async unenrollStudent(enrollmentId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ENROLLMENT_BY_ID(enrollmentId));
  }

  // ========== FUTURO: Agregar más métodos aquí ==========
  // - Assignments
  // - Submissions
  // - Analytics
  // etc.
}


