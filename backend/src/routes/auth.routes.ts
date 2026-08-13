import { Router } from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/user.schema';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), resetPassword);

export default router;
