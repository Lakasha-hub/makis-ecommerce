import { z } from 'zod';
import { Types } from 'mongoose';

const objectIdOrString = z.string().refine((val) => {
  return Types.ObjectId.isValid(val) || val.length > 0;
}, 'Must be a valid string or ObjectId');

export const addOrUpdateCartItemSchema = z.object({
  body: z.object({
    cartId: objectIdOrString.optional(),
    userId: objectIdOrString.optional(),
    productId: objectIdOrString.describe('Valid ObjectId or SKU string'),
    variantId: objectIdOrString.describe('Valid ObjectId or variant SKU string'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1')
  })
});
