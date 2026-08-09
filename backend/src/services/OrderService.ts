import { OrderRepository } from '../repositories/OrderRepository';
import { CartRepository } from '../repositories/CartRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { UserRepository } from '../repositories/UserRepository';
import { IOrder, IShippingAddress, OrderStatus } from '../models/Order';
import { AppError } from '../utils/AppError';
import { Types } from 'mongoose';
import { emailService } from './EmailService';

const orderRepository = new OrderRepository();
const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const userRepository = new UserRepository();

export class OrderService {
  async createOrderFromCart(userId: string, shippingAddress: IShippingAddress): Promise<IOrder> {
    const cart = await cartRepository.findByUserId(userId);
    
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }

    // Validar stock de todos los items antes de proceder
    for (const item of cart.items) {
      const product = await productRepository.findById(item.productId);
      if (!product) {
        throw new AppError(`Product ${item.productId} not found`, 404);
      }
      
      const variant = product.variants.find(v => (v._id && v._id.toString() === item.variantId.toString()) || v.sku === item.variantId.toString());
      if (!variant) {
        throw new AppError(`Variant ${item.variantId} not found in product ${item.productId}`, 404);
      }

      if (variant.stock < item.quantity) {
        throw new AppError(`Not enough stock for variant ${variant.specificationLabel}: ${variant.specificationValue}`, 400);
      }
    }

    // Descontar stock
    try {
      for (const item of cart.items) {
        const product = await productRepository.findById(item.productId);
        const variant = product!.variants.find(v => (v._id && v._id.toString() === item.variantId.toString()) || v.sku === item.variantId.toString());

        await productRepository.updateVariantStock(
          item.productId.toString(),
          item.variantId.toString(),
          variant!.stock - item.quantity
        );
      }
    } catch (error) {
      // Fallo de infraestructura: el stock quedó parcialmente descontado (inconsistencia de datos)
      throw new AppError('Failed to update stock during order creation', 500, false);
    }

    const orderData: Partial<IOrder> = {
      userId,
      items: cart.items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        specification: item.specification,
        unitPrice: item.unitPrice,
        quantity: item.quantity
      })),
      totalAmount: cart.totalAmount,
      status: 'pending',
      shippingAddress
    };

    const order = await orderRepository.create(orderData);

    // Vaciar carrito
    cart.items = [];
    cart.totalAmount = 0;
    await cartRepository.save(cart);

    // Enviar email de confirmación (fire and forget)
    userRepository.findById(userId).then(user => {
      if (user) {
        emailService.sendOrderConfirmation(user.email, user.name, order).catch(console.error);
      }
    }).catch(console.error);

    return order;
  }

  async getUserOrders(userId: string): Promise<IOrder[]> {
    return orderRepository.findByUserId(userId);
  }

  async getOrderById(orderId: string, userId: string, userRole: string): Promise<IOrder> {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Forbidden: You can only view your own orders', 403);
    }

    return order;
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<IOrder> {
    const order = await orderRepository.updateStatus(orderId, status);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Enviar email de actualización de estado (fire and forget)
    userRepository.findById(order.userId).then(user => {
      if (user) {
        emailService.sendOrderStatusUpdate(user.email, user.name, order).catch(console.error);
      }
    }).catch(console.error);

    return order;
  }

  async cancelOrder(orderId: string, userId: string, userRole: string): Promise<IOrder> {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.userId.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Forbidden: You can only cancel your own orders', 403);
    }

    if (order.status === 'cancelled') {
      throw new AppError('Order is already cancelled', 400);
    }

    if (order.status !== 'pending' && userRole !== 'admin') {
      throw new AppError('Only pending orders can be cancelled by clients', 400);
    }

    const updatedOrder = await orderRepository.updateStatus(orderId, 'cancelled');

    // Restituir stock
    try {
      for (const item of order.items) {
        const product = await productRepository.findById(item.productId);
        if (product) {
          const variant = product.variants.find(v => (v._id && v._id.toString() === item.variantId.toString()) || v.sku === item.variantId.toString());
          if (variant) {
            await productRepository.updateVariantStock(
              item.productId.toString(),
              item.variantId.toString(),
              variant.stock + item.quantity
            );
          }
        }
      }
    } catch (error) {
      // Fallo de infraestructura: el stock quedó parcialmente restituido (inconsistencia de datos)
      throw new AppError('Failed to restore stock during order cancellation', 500, false);
    }

    return updatedOrder!;
  }
}
