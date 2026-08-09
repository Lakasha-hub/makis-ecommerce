import { Router } from 'express';
import { addOrUpdateCartItem, getCart, getCartByUserId, removeCartItem, emptyCart, updateItemQuantity } from '../controllers/cart.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { addOrUpdateCartItemSchema } from '../schemas/cart.schema';
import { authenticateJWT } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateRequest(addOrUpdateCartItemSchema), addOrUpdateCartItem);
router.get('/user/:userId', getCartByUserId);
router.get('/:id', getCart);
router.put('/:id/items/:variantId', updateItemQuantity);
router.delete('/:id/items/:variantId', removeCartItem);
router.delete('/:id', emptyCart);

export default router;
