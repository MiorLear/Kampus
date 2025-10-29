import { Router } from 'express';
import { UsersController } from '../controllers/users.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const usersController = new UsersController();

// Todos los endpoints requieren autenticación
router.use(authenticate);

// Rutas
router.get('/stats', usersController.getUserStats);
router.get('/:id', usersController.getUser);
router.get('/', usersController.getAllUsers);
router.put('/:id', usersController.updateUser);
router.delete('/:id', usersController.deleteUser);

export default router;


