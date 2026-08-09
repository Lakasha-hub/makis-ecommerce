import { Request, Response } from 'express';
import { OrderService } from '../services/OrderService';
import { sendResponse } from '../utils/response';
import { catchAsync } from '../utils/catchAsync';

const orderService = new OrderService();

export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { shippingAddress } = req.body;

  const order = await orderService.createOrderFromCart(userId, shippingAddress);
  sendResponse(res, 201, order, 'Order created successfully');
});

export const getMyOrders = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const orders = await orderService.getUserOrders(userId);
  sendResponse(res, 200, orders, 'Orders fetched successfully');
});

export const getOrderById = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;
  const { id } = req.params;

  const order = await orderService.getOrderById(id, userId, userRole);
  sendResponse(res, 200, order, 'Order fetched successfully');
});

export const updateOrderStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const order = await orderService.updateOrderStatus(id, status);
  sendResponse(res, 200, order, 'Order status updated successfully');
});

export const cancelOrder = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const userRole = (req as any).user.role;
  const { id } = req.params;

  const order = await orderService.cancelOrder(id, userId, userRole);
  sendResponse(res, 200, order, 'Order cancelled successfully');
});
