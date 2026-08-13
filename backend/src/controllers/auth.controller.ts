import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { sendResponse } from '../utils/response';
import { catchAsync } from '../utils/catchAsync';

const authService = new AuthService();

export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.register(req.body);
  sendResponse(res, 201, result, 'User registered successfully');
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendResponse(res, 200, result, 'Logged in successfully');
});

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  // Respuesta genérica para no revelar si el email existe
  sendResponse(res, 200, null, 'Si el email existe, recibirás un enlace de recuperación en breve');
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  sendResponse(res, 200, null, 'Contraseña actualizada correctamente');
});
