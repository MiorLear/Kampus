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
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { course_id, progress } = req.body;
    
    if (!course_id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'course_id is required'
      });
    }

    const enrollmentId = await this.enrollmentsService.enrollStudent({
      student_id: userId, // Del token
      course_id,
      progress: progress || 0
    });

    res.status(201).json({
      id: enrollmentId,
      message: 'Enrollment created successfully'
    });
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

