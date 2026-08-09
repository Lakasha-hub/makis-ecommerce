import { User, IUser } from '../models/User';
import { Types } from 'mongoose';

export class UserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  }

  async findById(id: string | Types.ObjectId): Promise<IUser | null> {
    return User.findById(id);
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    const newUser = new User(userData);
    return newUser.save();
  }

  async update(id: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async softDelete(id: string | Types.ObjectId): Promise<IUser | null> {
    return User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }
}
