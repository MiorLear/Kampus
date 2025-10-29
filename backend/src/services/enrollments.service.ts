import { EnrollmentsRepository } from '../repositories/enrollments.repository';

export class EnrollmentsService {
  private enrollmentsRepo: EnrollmentsRepository;

  constructor() {
    this.enrollmentsRepo = new EnrollmentsRepository();
  }

  /**
   * Obtener inscripciones por estudiante
   */
  async getEnrollmentsByStudent(studentId: string): Promise<any[]> {
    return this.enrollmentsRepo.findByStudent(studentId);
  }

  /**
   * Obtener inscripciones por curso
   */
  async getEnrollmentsByCourse(courseId: string): Promise<any[]> {
    return this.enrollmentsRepo.findByCourse(courseId);
  }

  /**
   * Crear inscripción
   */
  async enrollStudent(data: { student_id: string; course_id: string; progress?: number }): Promise<string> {
    // Verificar si ya está inscrito
    const isEnrolled = await this.enrollmentsRepo.isEnrolled(data.student_id, data.course_id);
    if (isEnrolled) {
      throw new Error('Student is already enrolled in this course');
    }

    return this.enrollmentsRepo.createEnrollment({
      student_id: data.student_id,
      course_id: data.course_id,
      progress: data.progress || 0,
      status: 'active'
    });
  }

  /**
   * Eliminar inscripción
   */
  async unenrollStudent(enrollmentId: string): Promise<void> {
    await this.enrollmentsRepo.delete(enrollmentId);
  }

  /**
   * Actualizar progreso de inscripción
   */
  async updateEnrollmentProgress(enrollmentId: string, progress: number): Promise<void> {
    await this.enrollmentsRepo.update(enrollmentId, { progress });
  }
}


