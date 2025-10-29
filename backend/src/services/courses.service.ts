import { CoursesRepository } from '../repositories/courses.repository';

export class CoursesService {
  private coursesRepo: CoursesRepository;

  constructor() {
    this.coursesRepo = new CoursesRepository();
  }

  /**
   * Obtener todos los cursos
   */
  async getAllCourses(teacherId?: string): Promise<any[]> {
    if (teacherId) {
      return this.coursesRepo.findByTeacher(teacherId);
    }
    return this.coursesRepo.findAll();
  }

  /**
   * Obtener un curso por ID
   */
  async getCourse(courseId: string): Promise<any | null> {
    return this.coursesRepo.findById(courseId);
  }

  /**
   * Crear curso
   */
  async createCourse(course: Omit<any, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    return this.coursesRepo.create(course);
  }

  /**
   * Actualizar curso
   */
  async updateCourse(courseId: string, updates: Partial<any>): Promise<void> {
    await this.coursesRepo.update(courseId, updates);
  }

  /**
   * Eliminar curso
   */
  async deleteCourse(courseId: string): Promise<void> {
    await this.coursesRepo.delete(courseId);
  }
}


