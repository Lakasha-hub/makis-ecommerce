import { z } from 'zod';

const productCategories = ['anillo', 'arito', 'collar', 'pulsera', 'accesorio'] as const;
const productMaterials = [
  'fantasia',
  'acero_quirurgico',
  'acero_dorado',
  'acero_rosado',
  'acero_blanco',
  'plata',
  'oro',
  'bronce_plateado',
  'bronce'
] as const;

export const variantSchema = z.object({
  sku: z.string().optional(),
  specificationLabel: z.string().min(1, 'Specification label is required'),
  specificationValue: z.string().min(1, 'Specification value is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  price: z.number().min(0, 'Price cannot be negative').optional(),
});

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().min(0, 'Price cannot be negative'),
    category: z.enum(['anillo', 'arito', 'collar', 'pulsera', 'accesorio'], {
      message: 'Invalid product category'
    }),
    material: z.enum([
      'fantasia',
      'acero_quirurgico',
      'acero_dorado',
      'acero_rosado',
      'acero_blanco',
      'plata',
      'oro',
      'bronce_plateado',
      'bronce'
    ], {
      message: 'Invalid product material'
    }),
    images: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image is required'),
    isActive: z.boolean().optional().default(true),
    variants: z.array(variantSchema).min(1, 'At least one variant is required')
  })
});

export const updateProductSchema = z.object({
  body: z.object({
    sku: z.string().optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    price: z.number().min(0, 'Price cannot be negative').optional(),
    category: z.enum(['anillo', 'arito', 'collar', 'pulsera', 'accesorio']).optional(),
    material: z.enum([
      'fantasia',
      'acero_quirurgico',
      'acero_dorado',
      'acero_rosado',
      'acero_blanco',
      'plata',
      'oro',
      'bronce_plateado',
      'bronce'
    ]).optional(),
    images: z.array(z.string().url('Invalid image URL')).min(1).optional(),
    isActive: z.boolean().optional(),
    variants: z.array(variantSchema).min(1).optional()
  }),
  params: z.object({
    id: z.string()
  })
});

export const updateVariantStockSchema = z.object({
  body: z.object({
    stock: z.number().int().min(0, 'Stock cannot be negative')
  }),
  params: z.object({
    id: z.string(),
    variantId: z.string()
  })
});
