import { Order, IOrder, OrderStatus } from '../models/Order';
import { Types } from 'mongoose';

export class OrderRepository {
  async create(orderData: Partial<IOrder>): Promise<IOrder> {
    const newOrder = new Order(orderData);
    return newOrder.save();
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<IOrder[]> {
    return Order.find({ userId }).sort({ createdAt: -1 });
  }

  async findById(id: string | Types.ObjectId): Promise<IOrder | null> {
    return Order.findById(id);
  }

  async findByPaymentId(paymentId: string): Promise<IOrder | null> {
    return Order.findOne({ paymentId });
  }

  async updateStatus(id: string | Types.ObjectId, status: OrderStatus): Promise<IOrder | null> {
    return Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );
  }
}
