import { Router } from 'express';
import usersRoutes from './users.routes';
import modulesRoutes from './modules.routes';
import progressRoutes from './progress.routes';
import coursesRoutes from './courses.routes';
import enrollmentsRoutes from './enrollments.routes';

const router = Router();

// API Routes
router.use('/users', usersRoutes);
router.use('/modules', modulesRoutes);
router.use('/progress', progressRoutes);
router.use('/courses', coursesRoutes);
router.use('/enrollments', enrollmentsRoutes);

export default router;


