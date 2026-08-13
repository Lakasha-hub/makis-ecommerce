import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  })
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    email: z.string().email('Invalid email address').optional(),
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email inválido'),
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  })
});
