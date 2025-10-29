import { BaseRepository } from './base.repository';
import { db } from '../config/firebase';

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

export class ModulesRepository extends BaseRepository<CourseModule> {
  constructor() {
    super('course_modules');
  }

  /**
   * Obtener módulos de un curso ordenados por orden
   */
  async findByCourse(courseId: string): Promise<CourseModule[]> {
    try {
      // Intentar ordenar por 'order', si falla (por falta de índice), obtener todos y ordenar localmente
      let snapshot;
      try {
        snapshot = await this.collection
          .where('course_id', '==', courseId)
          .orderBy('order')
          .get();
      } catch (orderError: any) {
        // Si falla por falta de índice, obtener sin ordenar y ordenar localmente
        console.warn('Index error, sorting locally:', orderError.message);
        snapshot = await this.collection
          .where('course_id', '==', courseId)
          .get();
      }
      
      const modules = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as CourseModule));
      
      // Ordenar localmente por order (por si acaso)
      modules.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      return modules;
    } catch (error) {
      console.error(`Error getting modules for course ${courseId}:`, error);
      throw error;
    }
  }

  /**
   * Crear módulo para un curso
   */
  async createForCourse(courseId: string, module: Omit<CourseModule, 'id' | 'course_id' | 'created_at' | 'updated_at'>): Promise<string> {
    try {
      const docRef = await this.collection.add({
        course_id: courseId,
        ...module,
        order: module.order ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating module for course ${courseId}:`, error);
      throw error;
    }
  }
}

