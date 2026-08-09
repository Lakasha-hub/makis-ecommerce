import { Router } from 'express';
import { getProfile, updateProfile, deleteUser } from '../controllers/user.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { updateUserSchema } from '../schemas/user.schema';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJWT);

router.get('/me', getProfile);
router.put('/me', validateRequest(updateUserSchema), updateProfile);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

export default router;
