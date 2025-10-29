import { Request, Response } from 'express';
import { ModulesService } from '../services/modules.service';
import { asyncHandler } from '../middleware/error.middleware';

export class ModulesController {
  private modulesService: ModulesService;

  constructor() {
    this.modulesService = new ModulesService();
  }

  /**
   * GET /api/courses/:courseId/modules
   */
  getModulesByCourse = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const modules = await this.modulesService.getModulesByCourse(courseId);
    res.json(modules);
  });

  /**
   * GET /api/modules/:id
   */
  getModule = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const module = await this.modulesService.getModule(id);
    
    if (!module) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Module not found'
      });
    }
    
    res.json(module);
  });

  /**
   * POST /api/courses/:courseId/modules
   */
  createModule = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const moduleData = req.body;
    
    const moduleId = await this.modulesService.createModule(courseId, moduleData);
    
    res.status(201).json({
      id: moduleId,
      message: 'Module created successfully'
    });
  });

  /**
   * PUT /api/modules/:id
   */
  updateModule = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    await this.modulesService.updateModule(id, updates);
    
    res.json({
      message: 'Module updated successfully',
      id
    });
  });

  /**
   * DELETE /api/modules/:id
   */
  deleteModule = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await this.modulesService.deleteModule(id);
    
    res.json({
      message: 'Module deleted successfully',
      id
    });
  });
}

