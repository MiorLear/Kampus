import { BaseRepository } from './base.repository';
import { db } from '../config/firebase';

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  module_id: string;
  completed: boolean;
  completed_at?: string;
  progress_percentage: number; // 0-100
  last_accessed_at: string;
  time_spent?: number;
  video_time_watched?: number;
  video_duration?: number;
  times_accessed?: number;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  total_modules: number;
  completed_modules: number;
  progress_percentage: number; // 0-100
  last_accessed_at: string;
  updated_at: string;
}

export class UserProgressRepository extends BaseRepository<UserProgress> {
  constructor() {
    super('user_progress');
  }

  /**
   * Buscar progreso de un usuario en un módulo específico
   */
  async findByUserAndModule(userId: string, courseId: string, moduleId: string): Promise<UserProgress | null> {
    try {
      const snapshot = await this.collection
        .where('user_id', '==', userId)
        .where('course_id', '==', courseId)
        .where('module_id', '==', moduleId)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as UserProgress;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  /**
   * Obtener todo el progreso de un usuario en un curso
   */
  async findByUserAndCourse(userId: string, courseId: string): Promise<UserProgress[]> {
    try {
      const snapshot = await this.collection
        .where('user_id', '==', userId)
        .where('course_id', '==', courseId)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as UserProgress));
    } catch (error) {
      console.error('Error getting user progress for course:', error);
      throw error;
    }
  }

  /**
   * Guardar o actualizar progreso de acceso a módulo
   */
  async saveAccess(
    userId: string,
    courseId: string,
    moduleId: string,
    progressPercentage?: number
  ): Promise<void> {
    try {
      const existing = await this.findByUserAndModule(userId, courseId, moduleId);
      const now = new Date().toISOString();

      if (existing) {
        await this.collection.doc(existing.id).update({
          last_accessed_at: now,
          times_accessed: (existing.times_accessed || 0) + 1,
          ...(progressPercentage !== undefined && {
            progress_percentage: Math.max(existing.progress_percentage || 0, progressPercentage)
          })
        });
      } else {
        await this.collection.add({
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          completed: false,
          progress_percentage: progressPercentage || 0,
          last_accessed_at: now,
          times_accessed: 1
        });
      }
    } catch (error) {
      console.error('Error saving module access:', error);
      throw error;
    }
  }

  /**
   * Guardar progreso parcial (videos, tiempo, etc.)
   */
  async saveProgress(
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
    try {
      const existing = await this.findByUserAndModule(userId, courseId, moduleId);
      const now = new Date().toISOString();

      if (existing) {
        const updates: any = {
          last_accessed_at: now,
          ...progressData
        };

        // Si se proporciona tiempo de video, calcular porcentaje
        if (progressData.video_time_watched && progressData.video_duration) {
          const calculatedPercentage = Math.min(
            100,
            Math.round((progressData.video_time_watched / progressData.video_duration) * 100)
          );
          updates.progress_percentage = Math.max(
            existing.progress_percentage || 0,
            calculatedPercentage
          );
        }

        await this.collection.doc(existing.id).update(updates);
      } else {
        const progressPercentage = progressData.progress_percentage ||
          (progressData.video_time_watched && progressData.video_duration
            ? Math.round((progressData.video_time_watched / progressData.video_duration) * 100)
            : 0);

        await this.collection.add({
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          completed: false,
          progress_percentage: progressPercentage,
          last_accessed_at: now,
          times_accessed: 1,
          ...progressData
        });
      }
    } catch (error) {
      console.error('Error saving module progress:', error);
      throw error;
    }
  }

  /**
   * Marcar módulo como completado
   */
  async markComplete(userId: string, courseId: string, moduleId: string): Promise<void> {
    try {
      const existing = await this.findByUserAndModule(userId, courseId, moduleId);
      const now = new Date().toISOString();

      if (existing) {
        await this.collection.doc(existing.id).update({
          completed: true,
          completed_at: now,
          progress_percentage: 100,
          last_accessed_at: now
        });
      } else {
        await this.collection.add({
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          completed: true,
          completed_at: now,
          progress_percentage: 100,
          last_accessed_at: now,
          times_accessed: 1
        });
      }
    } catch (error) {
      console.error('Error marking module complete:', error);
      throw error;
    }
  }
}

export class CourseProgressRepository extends BaseRepository<CourseProgress> {
  constructor() {
    super('course_progress');
  }

  /**
   * Obtener progreso de curso de un usuario
   */
  async findByUserAndCourse(userId: string, courseId: string): Promise<CourseProgress | null> {
    try {
      const snapshot = await this.collection
        .where('user_id', '==', userId)
        .where('course_id', '==', courseId)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as CourseProgress;
    } catch (error) {
      console.error('Error getting course progress:', error);
      throw error;
    }
  }

  /**
   * Actualizar progreso del curso
   */
  async updateProgress(
    userId: string,
    courseId: string,
    totalModules: number,
    completedModules: number
  ): Promise<void> {
    try {
      const existing = await this.findByUserAndCourse(userId, courseId);
      const now = new Date().toISOString();
      const progressPercentage = totalModules > 0
        ? Math.round((completedModules / totalModules) * 100)
        : 0;

      if (existing) {
        await this.collection.doc(existing.id).update({
          total_modules: totalModules,
          completed_modules: completedModules,
          progress_percentage: progressPercentage,
          last_accessed_at: now,
          updated_at: now
        });
      } else {
        await this.collection.add({
          user_id: userId,
          course_id: courseId,
          total_modules: totalModules,
          completed_modules: completedModules,
          progress_percentage: progressPercentage,
          last_accessed_at: now,
          updated_at: now
        });
      }
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }
}

