import { BaseRepository } from './base.repository';

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
}

export class EnrollmentsRepository extends BaseRepository<Enrollment> {
  constructor() {
    super('enrollments');
  }

  /**
   * Buscar inscripciones por estudiante
   */
  async findByStudent(studentId: string): Promise<Enrollment[]> {
    return this.findBy('student_id', studentId);
  }

  /**
   * Buscar inscripciones por curso
   */
  async findByCourse(courseId: string): Promise<Enrollment[]> {
    return this.findBy('course_id', courseId);
  }

  /**
   * Verificar si un estudiante está inscrito en un curso
   */
  async isEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const snapshot = await this.collection
      .where('student_id', '==', studentId)
      .where('course_id', '==', courseId)
      .limit(1)
      .get();
    
    return !snapshot.empty;
  }

  /**
   * Crear inscripción
   */
  async createEnrollment(data: Omit<Enrollment, 'id' | 'enrolled_at'>): Promise<string> {
    const enrollment: Omit<Enrollment, 'id'> = {
      ...data,
      enrolled_at: new Date().toISOString(),
      status: data.status || 'active'
    };
    return this.create(enrollment);
  }
}


