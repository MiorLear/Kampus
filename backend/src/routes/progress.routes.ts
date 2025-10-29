import { Router } from 'express';
import { ProgressController } from '../controllers/progress.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const progressController = new ProgressController();

// Todos los endpoints requieren autenticación
router.use(authenticate);

// Rutas
router.post('/access', progressController.saveModuleAccess);
router.post('/', progressController.saveModuleProgress);
router.post('/complete', progressController.markModuleComplete);
router.get('/module/:courseId/:moduleId', progressController.getModuleProgress);
router.get('/course/:courseId', progressController.getCourseModuleProgress);
router.get('/course/:courseId/summary', progressController.getCourseProgress);

export default router;

