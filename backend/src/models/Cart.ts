import { Schema, model, Types } from 'mongoose';

export interface ICartItem {
  productId: Types.ObjectId | string;
  variantId: Types.ObjectId | string;
  title: string;
  specification: string;
  unitPrice: number;
  quantity: number;
}

export interface ICart {
  userId?: Types.ObjectId | string;
  items: ICartItem[];
  totalAmount: number;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  specification: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [cartItemSchema],
    totalAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

export const Cart = model<ICart>('Cart', cartSchema);
