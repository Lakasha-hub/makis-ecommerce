import { Router } from 'express';
import { createOrder, getMyOrders, getOrderById, updateOrderStatus, cancelOrder } from '../controllers/order.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticateJWT);

router.post('/', validateRequest(createOrderSchema), createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorizeRoles('admin'), validateRequest(updateOrderStatusSchema), updateOrderStatus);
router.post('/:id/cancel', cancelOrder);

export default router;
