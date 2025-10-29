import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../services/users.service';
import { asyncHandler } from '../middleware/error.middleware';

export class UsersController {
  private usersService: UsersService;

  constructor() {
    this.usersService = new UsersService();
  }

  /**
   * GET /api/users/:id
   */
  getUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.usersService.getUser(id);
    
    if (!user) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'User not found' 
      });
    }
    
    res.json(user);
  });

  /**
   * GET /api/users?role=student
   */
  getAllUsers = asyncHandler(async (req: Request, res: Response) => {
    const role = req.query.role as string | undefined;
    
    const users = role
      ? await this.usersService.getUsersByRole(role as 'student' | 'teacher' | 'admin')
      : await this.usersService.getAllUsers();
    
    res.json(users);
  });

  /**
   * PUT /api/users/:id
   */
  updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    
    // Validaciones básicas
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'No update data provided'
      });
    }

    await this.usersService.updateUser(id, updates);
    
    res.json({ 
      message: 'User updated successfully',
      id 
    });
  });

  /**
   * DELETE /api/users/:id
   */
  deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    await this.usersService.deleteUser(id);
    
    res.json({ 
      message: 'User deleted successfully',
      id 
    });
  });

  /**
   * GET /api/users/stats
   */
  getUserStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await this.usersService.getUserStats();
    res.json(stats);
  });
}


