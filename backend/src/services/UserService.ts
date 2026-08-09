import { UserRepository } from '../repositories/UserRepository';
import { IUser } from '../models/User';
import { AppError } from '../utils/AppError';

const userRepository = new UserRepository();

export class UserService {
  async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new AppError('User not found', 404);
    }
    const userResponse = ('toObject' in user ? (user as any).toObject() : user);
    delete userResponse.password;
    return userResponse;
  }

  async updateProfile(userId: string, updateData: Partial<IUser>): Promise<Partial<IUser>> {
    const updatedUser = await userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new AppError('User not found', 404);
    }
    const userResponse = ('toObject' in updatedUser ? (updatedUser as any).toObject() : updatedUser);
    delete userResponse.password;
    return userResponse;
  }

  async deleteProfile(userId: string): Promise<void> {
    const deletedUser = await userRepository.softDelete(userId);
    if (!deletedUser) {
      throw new AppError('User not found', 404);
    }
  }
}
