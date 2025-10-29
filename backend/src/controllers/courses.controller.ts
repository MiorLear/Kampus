import { Request, Response } from 'express';
import { CoursesService } from '../services/courses.service';
import { asyncHandler } from '../middleware/error.middleware';

export class CoursesController {
  private coursesService: CoursesService;

  constructor() {
    this.coursesService = new CoursesService();
  }

  /**
   * GET /api/courses
   */
  getAllCourses = asyncHandler(async (req: Request, res: Response) => {
    const { teacher_id } = req.query;
    console.log('GET /api/courses - Query params:', { teacher_id });
    
    try {
      const courses = await this.coursesService.getAllCourses(teacher_id as string);
      console.log(`Found ${courses.length} courses`);
      res.json(courses);
    } catch (error: any) {
      console.error('Error in getAllCourses:', error);
      throw error;
    }
  });

  /**
   * GET /api/courses/:id
   */
  getCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const course = await this.coursesService.getCourse(id);
    
    if (!course) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Course not found'
      });
    }
    
    res.json(course);
  });

  /**
   * POST /api/courses
   */
  createCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseData = req.body;
    const courseId = await this.coursesService.createCourse(courseData);
    
    res.status(201).json({
      id: courseId,
      message: 'Course created successfully'
    });
  });

  /**
   * PUT /api/courses/:id
   */
  updateCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    await this.coursesService.updateCourse(id, updates);
    
    res.json({
      message: 'Course updated successfully',
      id
    });
  });

  /**
   * DELETE /api/courses/:id
   */
  deleteCourse = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await this.coursesService.deleteCourse(id);
    
    res.json({
      message: 'Course deleted successfully',
      id
    });
  });
}

