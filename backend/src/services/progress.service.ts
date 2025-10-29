import { 
  UserProgressRepository, 
  CourseProgressRepository,
  UserProgress,
  CourseProgress
} from '../repositories/progress.repository';
import { ModulesRepository } from '../repositories/modules.repository';

export class ProgressService {
  private userProgressRepo: UserProgressRepository;
  private courseProgressRepo: CourseProgressRepository;
  private modulesRepo: ModulesRepository;

  constructor() {
    this.userProgressRepo = new UserProgressRepository();
    this.courseProgressRepo = new CourseProgressRepository();
    this.modulesRepo = new ModulesRepository();
  }

  /**
   * Guardar acceso a módulo
   */
  async saveModuleAccess(
    userId: string,
    courseId: string,
    moduleId: string,
    progressPercentage?: number
  ): Promise<void> {
    await this.userProgressRepo.saveAccess(userId, courseId, moduleId, progressPercentage);
    await this.updateCourseProgress(userId, courseId);
  }

  /**
   * Guardar progreso parcial de módulo
   */
  async saveModuleProgress(
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
    await this.userProgressRepo.saveProgress(userId, courseId, moduleId, progressData);
    await this.updateCourseProgress(userId, courseId);
  }

  /**
   * Marcar módulo como completado
   */
  async markModuleComplete(userId: string, courseId: string, moduleId: string): Promise<void> {
    await this.userProgressRepo.markComplete(userId, courseId, moduleId);
    await this.updateCourseProgress(userId, courseId);
  }

  /**
   * Obtener progreso de un módulo
   */
  async getModuleProgress(userId: string, courseId: string, moduleId: string): Promise<UserProgress | null> {
    return this.userProgressRepo.findByUserAndModule(userId, courseId, moduleId);
  }

  /**
   * Obtener progreso de todos los módulos de un curso
   */
  async getCourseModuleProgress(userId: string, courseId: string): Promise<UserProgress[]> {
    return this.userProgressRepo.findByUserAndCourse(userId, courseId);
  }

  /**
   * Obtener progreso del curso completo
   */
  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    return this.courseProgressRepo.findByUserAndCourse(userId, courseId);
  }

  /**
   * Actualizar progreso del curso (calcula basado en módulos completados)
   */
  private async updateCourseProgress(userId: string, courseId: string): Promise<void> {
    try {
      // Obtener todos los módulos del curso
      const modules = await this.modulesRepo.findByCourse(courseId);
      const totalModules = modules.length;

      // Obtener progreso de todos los módulos
      const userProgress = await this.userProgressRepo.findByUserAndCourse(userId, courseId);
      const completedModules = userProgress.filter(p => p.completed).length;

      // Actualizar progreso del curso
      await this.courseProgressRepo.updateProgress(
        userId,
        courseId,
        totalModules,
        completedModules
      );
    } catch (error) {
      console.error('Error updating course progress:', error);
      throw error;
    }
  }
}

