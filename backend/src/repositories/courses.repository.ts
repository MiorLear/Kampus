import { BaseRepository } from './base.repository';
import { db } from '../config/firebase';

export interface Course {
  id: string;
  title: string;
  description: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  type: 'text' | 'video' | 'pdf' | 'image' | 'link' | 'assignment';
  content?: string;
  url?: string;
  file_url?: string;
  duration?: string;
  order: number;
  created_at: string;
  updated_at: string;
}

export class CoursesRepository extends BaseRepository<Course> {
  constructor() {
    super('courses');
  }

  /**
   * Buscar cursos por profesor
   */
  async findByTeacher(teacherId: string): Promise<Course[]> {
    try {
      const snapshot = await this.collection
        .where('teacher_id', '==', teacherId)
        .get();
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Course));
    } catch (error) {
      console.error(`Error getting courses for teacher ${teacherId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener módulos de un curso
   */
  async getModules(courseId: string): Promise<CourseModule[]> {
    try {
      const modulesSnapshot = await db
        .collection('course_modules')
        .where('course_id', '==', courseId)
        .orderBy('order')
        .get();
      
      return modulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CourseModule));
    } catch (error) {
      console.error(`Error getting modules for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Agregar módulo a un curso
   */
  async addModule(courseId: string, module: Omit<CourseModule, 'id' | 'course_id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await db.collection('course_modules').add({
        course_id: courseId,
        ...module,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error adding module to course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Actualizar módulo
   */
  async updateModule(moduleId: string, updates: Partial<CourseModule>): Promise<void> {
    try {
      await db.collection('course_modules').doc(moduleId).update({
        ...updates,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`Error updating module ${moduleId}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar módulo
   */
  async deleteModule(moduleId: string): Promise<void> {
    try {
      await db.collection('course_modules').doc(moduleId).delete();
    } catch (error) {
      console.error(`Error deleting module ${moduleId}:`, error);
      throw error;
    }
  }
}


