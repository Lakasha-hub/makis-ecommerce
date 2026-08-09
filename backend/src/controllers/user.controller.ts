import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { sendResponse } from '../utils/response';
import { catchAsync } from '../utils/catchAsync';

const userService = new UserService();

export const getProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const user = await userService.getProfile(userId);
  sendResponse(res, 200, user, 'Profile fetched successfully');
});

export const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const user = await userService.updateProfile(userId, req.body);
  sendResponse(res, 200, user, 'Profile updated successfully');
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await userService.deleteProfile(id);
  sendResponse(res, 200, null, 'User logically deleted');
});
