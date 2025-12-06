import { Request, Response } from 'express';
import { EnrollmentsService } from '../services/enrollments.service';
import { asyncHandler } from '../middleware/error.middleware';

export class EnrollmentsController {
  private enrollmentsService: EnrollmentsService;

  constructor() {
    this.enrollmentsService = new EnrollmentsService();
  }

  /**
   * GET /api/enrollments?student_id=xxx o ?course_id=xxx
   */
  getEnrollments = asyncHandler(async (req: Request, res: Response) => {
    const { student_id, course_id } = req.query;
    
    console.log('GET /api/enrollments - Query params:', { student_id, course_id });
    
    let enrollments;
    try {
      if (student_id) {
        console.log(`Fetching enrollments for student: ${student_id}`);
        enrollments = await this.enrollmentsService.getEnrollmentsByStudent(student_id as string);
        console.log(`Found ${enrollments.length} enrollments for student`);
      } else if (course_id) {
        console.log(`Fetching enrollments for course: ${course_id}`);
        enrollments = await this.enrollmentsService.getEnrollmentsByCourse(course_id as string);
        console.log(`Found ${enrollments.length} enrollments for course`);
      } else {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'student_id or course_id query parameter is required'
        });
      }
      
      res.json(enrollments);
    } catch (error: any) {
      console.error('Error in getEnrollments:', error);
      throw error;
    }
  });

  /**
   * GET /api/enrollments/:id
   */
  getEnrollment = asyncHandler(async (req: Request, res: Response) => {
    // TODO: Implementar si es necesario
    res.status(501).json({
      error: 'Not Implemented',
      message: 'Get single enrollment not implemented'
    });
  });

  /**
   * POST /api/enrollments
   */
  createEnrollment = asyncHandler(async (req: Request, res: Response) => {
    console.log('POST /api/enrollments - Request body:', JSON.stringify(req.body, null, 2));
    console.log('POST /api/enrollments - Request headers:', req.headers);
    console.log('POST /api/enrollments - User:', req.user);
    
    const userId = req.user?.uid;
    if (!userId) {
      console.error('POST /api/enrollments - No user ID found');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Verificar que el body existe y tiene contenido
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('POST /api/enrollments - Empty request body');
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Request body is required'
      });
    }

    const { course_id, progress } = req.body;
    
    console.log('POST /api/enrollments - Parsed data:', { 
      course_id, 
      course_id_type: typeof course_id,
      course_id_value: course_id,
      progress, 
      userId 
    });
    
    // Validar que course_id existe y no está vacío
    if (!course_id || course_id === '' || course_id === null || course_id === undefined) {
      console.error('POST /api/enrollments - Missing or invalid course_id:', course_id);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'course_id is required and must be a non-empty string'
      });
    }

    // Validar que course_id es un string
    if (typeof course_id !== 'string') {
      console.error('POST /api/enrollments - course_id is not a string:', typeof course_id);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'course_id must be a string'
      });
    }

    try {
      const enrollmentId = await this.enrollmentsService.enrollStudent({
        student_id: userId, // Del token
        course_id,
        progress: progress || 0
      });

      res.status(201).json({
        id: enrollmentId,
        message: 'Enrollment created successfully'
      });
    } catch (error: any) {
      // Si el estudiante ya está inscrito, devolver 409 Conflict
      if (error.message && error.message.includes('already enrolled')) {
        return res.status(409).json({
          error: 'Conflict',
          message: 'Student is already enrolled in this course'
        });
      }
      // Re-lanzar el error para que el error handler lo maneje
      throw error;
    }
  });

  /**
   * DELETE /api/enrollments/:id
   */
  deleteEnrollment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await this.enrollmentsService.unenrollStudent(id);
    
    res.json({
      message: 'Enrollment deleted successfully',
      id
    });
  });
}

