import { Router } from 'express';
import { EnrollmentsController } from '../controllers/enrollments.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const enrollmentsController = new EnrollmentsController();

// Todos los endpoints requieren autenticación
router.use(authenticate);

// Rutas (el orden importa - las más específicas primero)
router.post('/', enrollmentsController.createEnrollment);
router.get('/', enrollmentsController.getEnrollments); // Debe ir antes de /:id
router.get('/:id', enrollmentsController.getEnrollment);
router.delete('/:id', enrollmentsController.deleteEnrollment);

export default router;

