import { Request, Response } from 'express';
import { ProgressService } from '../services/progress.service';
import { asyncHandler } from '../middleware/error.middleware';

export class ProgressController {
  private progressService: ProgressService;

  constructor() {
    this.progressService = new ProgressService();
  }

  /**
   * POST /api/progress/access
   * Guardar acceso a módulo
   */
  saveModuleAccess = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { courseId, moduleId, progressPercentage } = req.body;
    
    if (!courseId || !moduleId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'courseId and moduleId are required'
      });
    }

    await this.progressService.saveModuleAccess(
      userId,
      courseId,
      moduleId,
      progressPercentage
    );

    res.json({ message: 'Module access saved successfully' });
  });

  /**
   * POST /api/progress
   * Guardar progreso parcial de módulo
   */
  saveModuleProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { courseId, moduleId, progressData } = req.body;
    
    if (!courseId || !moduleId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'courseId and moduleId are required'
      });
    }

    await this.progressService.saveModuleProgress(
      userId,
      courseId,
      moduleId,
      progressData || {}
    );

    res.json({ message: 'Module progress saved successfully' });
  });

  /**
   * POST /api/progress/complete
   * Marcar módulo como completado
   */
  markModuleComplete = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { courseId, moduleId } = req.body;
    
    if (!courseId || !moduleId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'courseId and moduleId are required'
      });
    }

    await this.progressService.markModuleComplete(userId, courseId, moduleId);

    res.json({ message: 'Module marked as complete' });
  });

  /**
   * GET /api/progress/module/:courseId/:moduleId
   * Obtener progreso de un módulo específico (userId del usuario autenticado)
   */
  getModuleProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { courseId, moduleId } = req.params;
    
    const progress = await this.progressService.getModuleProgress(
      userId,
      courseId,
      moduleId
    );

    if (!progress) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Progress not found'
      });
    }

    res.json(progress);
  });

  /**
   * GET /api/progress/course/:courseId
   * Obtener progreso de todos los módulos de un curso (userId del usuario autenticado)
   */
  getCourseModuleProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { courseId } = req.params;
    
    const progress = await this.progressService.getCourseModuleProgress(
      userId,
      courseId
    );

    res.json(progress);
  });

  /**
   * GET /api/progress/course/:courseId/summary
   * Obtener resumen de progreso del curso (userId del usuario autenticado)
   */
  getCourseProgress = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const { courseId } = req.params;
    
    const progress = await this.progressService.getCourseProgress(
      userId,
      courseId
    );

    res.json(progress || {
      user_id: userId,
      course_id: courseId,
      total_modules: 0,
      completed_modules: 0,
      progress_percentage: 0
    });
  });
}

