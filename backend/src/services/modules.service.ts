import { ModulesRepository, CourseModule } from '../repositories/modules.repository';

export class ModulesService {
  private modulesRepo: ModulesRepository;

  constructor() {
    this.modulesRepo = new ModulesRepository();
  }

  /**
   * Obtener módulos de un curso
   */
  async getModulesByCourse(courseId: string): Promise<CourseModule[]> {
    return this.modulesRepo.findByCourse(courseId);
  }

  /**
   * Obtener un módulo por ID
   */
  async getModule(moduleId: string): Promise<CourseModule | null> {
    return this.modulesRepo.findById(moduleId);
  }

  /**
   * Crear módulo para un curso
   */
  async createModule(courseId: string, module: Omit<CourseModule, 'id' | 'course_id' | 'created_at' | 'updated_at'>): Promise<string> {
    return this.modulesRepo.createForCourse(courseId, module);
  }

  /**
   * Actualizar módulo
   */
  async updateModule(moduleId: string, updates: Partial<CourseModule>): Promise<void> {
    await this.modulesRepo.update(moduleId, updates);
  }

  /**
   * Eliminar módulo
   */
  async deleteModule(moduleId: string): Promise<void> {
    await this.modulesRepo.delete(moduleId);
  }
}

