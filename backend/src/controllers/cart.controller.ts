import { Request, Response } from 'express';
import { CartService } from '../services/CartService';
import { sendResponse } from '../utils/response';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const cartService = new CartService();

export const addOrUpdateCartItem = catchAsync(async (req: Request, res: Response) => {
  const { cartId, userId, productId, variantId, quantity } = req.body;

  try {
    const savedCart = await cartService.addOrUpdateCartItem(
      cartId,
      userId,
      productId,
      variantId,
      quantity
    );
    
    sendResponse(res, 200, savedCart, 'Cart updated successfully');
  } catch (error: any) {
    if (error.message.includes('Quantity must be at least 1') || error.message.includes('Not enough stock')) {
      throw new AppError(error.message, 400);
    }
    if (error.message.includes('Product not found') || error.message.includes('Variant not found')) {
      throw new AppError(error.message, 404);
    }
    throw error;
  }
});

export const getCart = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const cart = await cartService.getCart(id);
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }
    sendResponse(res, 200, cart, 'Cart fetched successfully');
  } catch (error: any) {
    if (error.message.includes('Invalid Cart ID')) {
      throw new AppError(error.message, 400);
    }
    throw error;
  }
});

export const getCartByUserId = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  try {
    const cart = await cartService.getCartByUserId(userId);
    if (!cart) {
      throw new AppError('Cart not found for this user', 404);
    }
    sendResponse(res, 200, cart, 'Cart fetched successfully');
  } catch (error: any) {
    if (error.message.includes('Invalid User ID')) {
      throw new AppError(error.message, 400);
    }
    throw error;
  }
});

export const removeCartItem = catchAsync(async (req: Request, res: Response) => {
  const { id, variantId } = req.params;
  
  try {
    const savedCart = await cartService.removeCartItem(id, variantId);
    sendResponse(res, 200, savedCart, 'Item removed successfully');
  } catch (error: any) {
    if (error.message.includes('Cart not found')) {
      throw new AppError(error.message, 404);
    }
    if (error.message.includes('Invalid Cart ID')) {
      throw new AppError(error.message, 400);
    }
    throw error;
  }
});

export const updateItemQuantity = catchAsync(async (req: Request, res: Response) => {
  const { id, variantId } = req.params;
  const { quantity } = req.body;
  
  try {
    const savedCart = await cartService.updateItemQuantity(id, variantId, quantity);
    sendResponse(res, 200, savedCart, 'Item quantity updated successfully');
  } catch (error: any) {
    if (error.message.includes('Cart not found') || error.message.includes('Item not found in cart') || error.message.includes('Product not found')) {
      throw new AppError(error.message, 404);
    }
    if (error.message.includes('Invalid Cart ID') || error.message.includes('Quantity cannot be negative') || error.message.includes('Not enough stock')) {
      throw new AppError(error.message, 400);
    }
    throw error;
  }
});

export const emptyCart = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  try {
    const savedCart = await cartService.emptyCart(id);
    sendResponse(res, 200, savedCart, 'Cart emptied successfully');
  } catch (error: any) {
    if (error.message.includes('Cart not found')) {
      throw new AppError(error.message, 404);
    }
    if (error.message.includes('Invalid Cart ID')) {
      throw new AppError(error.message, 400);
    }
    throw error;
  }
});
