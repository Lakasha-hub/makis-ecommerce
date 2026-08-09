import { Cart, ICart } from '../models/Cart';
import { Types } from 'mongoose';

export class CartRepository {
  async findById(id: string | Types.ObjectId): Promise<ICart | null> {
    return Cart.findById(id);
  }

  async findByUserId(userId: string | Types.ObjectId): Promise<ICart | null> {
    return Cart.findOne({ userId });
  }

  async create(cartData: Partial<ICart>): Promise<ICart> {
    const newCart = new Cart(cartData);
    return newCart.save();
  }

  async save(cart: any): Promise<ICart> {
    return cart.save();
  }
}
