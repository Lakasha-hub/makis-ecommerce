import { UserRepository } from '../repositories/UserRepository';
import { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../utils/AppError';
import { emailService } from './EmailService';

const userRepository = new UserRepository();

export class AuthService {
  async register(userData: Partial<IUser>): Promise<{ user: Partial<IUser>; token: string }> {
    const existingUser = await userRepository.findByEmail(userData.email!);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password!, salt);

    const userToCreate = {
      ...userData,
      password: hashedPassword,
      role: 'client' as const
    };

    const newUser = await userRepository.create(userToCreate);
    const token = this.generateToken(newUser);

    // Enviar email en background (fire and forget)
    emailService.sendUserRegistration(newUser.email, newUser.name).catch(console.error);

    const userResponse = ('toObject' in newUser ? (newUser as any).toObject() : newUser);
    delete userResponse.password;

    return { user: userResponse, token };
  }

  async login(email: string, password: string): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user);

    const userResponse = ('toObject' in user ? (user as any).toObject() : user);
    delete userResponse.password;

    return { user: userResponse, token };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await userRepository.findByEmail(email);

    // Respuesta genérica: no revelar si el email existe o no
    if (!user || !user.isActive) return;

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await userRepository.update((user as any)._id, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/auth?modo=reset&token=${token}`;

    await emailService.sendPasswordChange(user.email, user.name, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await userRepository.findByResetToken(token);

    if (!user) {
      throw new AppError('El enlace de recuperación es inválido o ya expiró', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await userRepository.update((user as any)._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    });
  }

  private generateToken(user: any): string {
    const payload = { id: user._id, role: user.role };
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_for_development';
    const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as any;

    try {
      return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
      throw new AppError('Failed to generate authentication token', 500, false);
    }
  }
}

