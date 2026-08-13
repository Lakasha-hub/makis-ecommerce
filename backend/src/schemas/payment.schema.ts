import { z } from 'zod';

const shippingAddressSchema = z.object({
  street: z.string().min(3, 'Ingresá la calle y número'),
  city: z.string().min(2, 'Ingresá la ciudad'),
  postalCode: z.string().min(3, 'Ingresá el código postal'),
  country: z.string().min(2, 'Ingresá el país'),
});

export const createPreferenceSchema = z.object({
  body: z.object({
    shippingAddress: shippingAddressSchema,
    items: z.array(z.object({
      productId: z.string(),
      variantId: z.string(),
      title: z.string(),
      spec: z.string(),
      qty: z.number().min(1),
      price: z.number().optional()
    })).min(1, 'El carrito está vacío')
  }),
});
