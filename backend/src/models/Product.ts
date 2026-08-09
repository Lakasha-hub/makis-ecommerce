import { Schema, model, Types } from 'mongoose';

export type ProductMaterial = 'fantasia' | 'acero_quirurgico' | 'acero_dorado' | 'acero_rosado' | 'acero_blanco' | 'plata' | 'oro' | 'bronce_plateado' | 'bronce';
export type ProductCategory = 'anillo' | 'arito' | 'collar' | 'pulsera' | 'accesorio';

export interface IVariant {
  _id?: Types.ObjectId;
  sku?: string;
  specificationLabel: string;
  specificationValue: string;
  stock: number;
  price?: number;
}

export interface IProduct {
  _id?: Types.ObjectId;
  sku?: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  material: ProductMaterial;
  images: string[];
  isActive: boolean;
  variants: IVariant[];
  totalStock?: number; // Virtual
}

const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: false },
  specificationLabel: { type: String, required: true },
  specificationValue: { type: String, required: true },
  stock: { type: Number, required: true, min: 0 },
  price: { type: Number }
});

const productSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: false },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ['anillo', 'arito', 'collar', 'pulsera', 'accesorio'] 
    },
    material: { 
      type: String, 
      required: true,
      enum: ['fantasia', 'acero_quirurgico', 'acero_dorado', 'acero_rosado', 'acero_blanco', 'plata', 'oro', 'bronce_plateado', 'bronce']
    },
    images: { 
      type: [String], 
      required: true,
      validate: [
        (val: string[]) => val.length > 0,
        'At least one image is required'
      ]
    },
    isActive: { type: Boolean, default: true },
    variants: {
      type: [variantSchema],
      required: true,
      validate: [
        (val: IVariant[]) => val.length > 0,
        'At least one variant is required'
      ]
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.virtual('totalStock').get(function() {
  if (!this.variants) return 0;
  return this.variants.reduce((total, variant) => total + variant.stock, 0);
});

export const Product = model<IProduct>('Product', productSchema);
