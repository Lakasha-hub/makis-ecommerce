import { Router } from 'express';
import { createPreference, webhook } from '../controllers/payment.controller';
import { authenticateJWT } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createPreferenceSchema } from '../schemas/payment.schema';

const router = Router();

router.post('/create-preference', authenticateJWT, validateRequest(createPreferenceSchema), createPreference);
router.post('/webhook', webhook);

export default router;
