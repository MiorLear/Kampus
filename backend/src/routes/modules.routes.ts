import { Router } from 'express';
import { ModulesController } from '../controllers/modules.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const modulesController = new ModulesController();

// Todos los endpoints requieren autenticación
router.use(authenticate);

// Rutas
router.get('/courses/:courseId/modules', modulesController.getModulesByCourse);
router.get('/:id', modulesController.getModule);
router.post('/courses/:courseId/modules', modulesController.createModule);
router.put('/:id', modulesController.updateModule);
router.delete('/:id', modulesController.deleteModule);

export default router;

