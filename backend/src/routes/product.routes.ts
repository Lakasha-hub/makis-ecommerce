import { Router } from 'express';
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, updateVariantStock } from '../controllers/product.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { createProductSchema, updateProductSchema, updateVariantStockSchema } from '../schemas/product.schema';
import { authenticateJWT, authorizeRoles } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticateJWT, authorizeRoles('admin'), validateRequest(createProductSchema), createProduct);
router.put('/:id', authenticateJWT, authorizeRoles('admin'), validateRequest(updateProductSchema), updateProduct);
router.patch('/:id/variants/:variantId/stock', authenticateJWT, authorizeRoles('admin'), validateRequest(updateVariantStockSchema), updateVariantStock);
router.delete('/:id', authenticateJWT, authorizeRoles('admin'), deleteProduct);

export default router;
