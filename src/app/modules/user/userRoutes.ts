import express from 'express';
import { deleteUser, getDashboardStats, getUserById, getUsers, updateUserRole } from './userController';
import { UserRole } from './user.model';
import { authenticate, authorize } from '../../middleware/authMiddleware';

const router = express.Router();

// Protected routes - Admin only
// router.use(authenticate);

router.get('/', authorize(UserRole.ADMIN), getUsers);
router.get('/dashboard/stats', authorize(UserRole.ADMIN), getDashboardStats);
router.get('/:id', getUserById);
router.patch('/:id/role', authorize(UserRole.ADMIN), updateUserRole);
router.delete('/:id', authorize(UserRole.ADMIN), deleteUser);

export default router;