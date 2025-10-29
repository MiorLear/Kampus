import { Router } from 'express';
import { CoursesController } from '../controllers/courses.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const coursesController = new CoursesController();

// Todos los endpoints requieren autenticación
router.use(authenticate);

// Rutas
router.get('/', coursesController.getAllCourses);
router.get('/:id', coursesController.getCourse);
router.post('/', coursesController.createCourse);
router.put('/:id', coursesController.updateCourse);
router.delete('/:id', coursesController.deleteCourse);

export default router;


