import { Schema, model, Types } from 'mongoose';

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrderItem {
  productId: Types.ObjectId | string;
  variantId: Types.ObjectId | string;
  title: string;
  specification: string;
  unitPrice: number;
  quantity: number;
}

export interface IShippingAddress {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface IOrder {
  userId: Types.ObjectId | string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: IShippingAddress;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  specification: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    shippingAddress: { type: shippingAddressSchema, required: true },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', orderSchema);
