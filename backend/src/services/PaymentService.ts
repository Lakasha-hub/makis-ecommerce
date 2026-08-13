import MercadoPago, { Preference, Payment } from 'mercadopago';
import { CartRepository } from '../repositories/CartRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { UserRepository } from '../repositories/UserRepository';
import { OrderRepository } from '../repositories/OrderRepository';
import { IShippingAddress } from '../models/Order';
import { AppError } from '../utils/AppError';
import { emailService } from './EmailService';

const cartRepository = new CartRepository();
const productRepository = new ProductRepository();
const userRepository = new UserRepository();
const orderRepository = new OrderRepository();

function getMPClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) throw new AppError('MP_ACCESS_TOKEN no configurado', 500, false);
  return new MercadoPago({ accessToken });
}

export class PaymentService {
  /**
   * Crea una preferencia de pago en Mercado Pago a partir del carrito del usuario.
   * Devuelve la URL de pago (init_point) y el preferenceId para trazabilidad.
   */
  async createPreference(
    userId: string,
    shippingAddress: IShippingAddress,
    items: any[]
  ): Promise<{ initPoint: string; preferenceId: string }> {
    if (!items || items.length === 0) {
      throw new AppError('El carrito está vacío', 400);
    }

    let totalAmount = 0;
    const orderItems = [];

    // Validar stock y armar items de la orden con precios reales de la BD
    for (const item of items) {
      const product = await productRepository.findById(item.productId.toString());
      if (!product || !product.isActive) {
        throw new AppError(`Producto no disponible: ${item.title}`, 400);
      }
      const variant = product.variants.find(
        (v) => v._id && v._id.toString() === item.variantId.toString()
      );
      if (!variant || variant.stock < item.qty) {
        throw new AppError(`Stock insuficiente para: ${item.title} (${item.spec})`, 400);
      }
      
      const price = variant.price ?? product.price;
      totalAmount += price * item.qty;

      orderItems.push({
        productId: product._id as any,
        variantId: variant._id as any,
        title: product.title,
        specification: item.spec,
        unitPrice: price,
        quantity: item.qty,
      });
    }

    // Creamos la orden en estado 'pending'
    const order = await orderRepository.create({
      userId,
      items: orderItems,
      totalAmount,
      status: 'pending',
      shippingAddress,
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const client = getMPClient();
    const preference = new Preference(client);

    // Guardamos el orderId en external_reference para recuperarlo en el webhook
    const externalReference = (order as any)._id.toString();

    const response = await preference.create({
      body: {
        items: orderItems.map((item) => ({
          id: (item.variantId as any).toString(),
          title: `${item.title} - ${item.specification}`,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          currency_id: 'ARS',
        })),
        back_urls: {
          success: `${frontendUrl}/pago/exitoso`,
          pending: `${frontendUrl}/pago/pendiente`,
          failure: `${frontendUrl}/pago/fallido`,
        },
        // Mercado Pago requiere HTTPS para auto_return. 
        // Si usamos http://localhost en desarrollo, fallará con 'back_url.success must be defined'
        ...(frontendUrl.startsWith('https') ? { auto_return: 'approved' } : {}),
        external_reference: externalReference,
        notification_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/payments/webhook`,
      },
    });

    if (!response.init_point || !response.id) {
      throw new AppError('Error al crear la preferencia de pago', 500, false);
    }
    
    // Actualizamos la orden con el preferenceId de MP
    await orderRepository.findById((order as any)._id).then(o => {
      if(o) {
        (o as any).preferenceId = response.id;
        (o as any).save();
      }
    });

    return { initPoint: response.init_point, preferenceId: response.id };
  }

  /**
   * Procesa la notificación de Mercado Pago (webhook IPN).
   * Solo actúa en pagos aprobados para evitar doble procesamiento.
   */
  async processWebhook(paymentId: string): Promise<void> {
    const client = getMPClient();
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    if (payment.status !== 'approved') return;

    // Evitar procesar el mismo pago dos veces
    const existing = await orderRepository.findByPaymentId(paymentId);
    if (existing) return;

    const orderId = payment.external_reference;
    if (!orderId) throw new AppError('external_reference vacío en el pago', 400);

    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new AppError('Orden no encontrada para este pago', 404);
    }
    
    // Si la orden ya está pagada por otra vía, salir
    if (order.status !== 'pending') return;

    // Descontar stock
    for (const item of order.items) {
      const product = await productRepository.findById(item.productId.toString());
      if (!product) continue;
      const variant = product.variants.find(
        (v) => v._id && v._id.toString() === item.variantId.toString()
      );
      if (!variant) continue;
      await productRepository.updateVariantStock(
        item.productId.toString(),
        item.variantId.toString(),
        Math.max(0, variant.stock - item.quantity)
      );
    }

    // Actualizar la orden a 'paid' y guardar datos del pago
    order.status = 'paid';
    (order as any).paymentId = paymentId;
    (order as any).preferenceId = (payment as any).preference_id ?? undefined;
    await (order as any).save();

    // Limpiar carrito si existiera en la DB
    const cart = await cartRepository.findByUserId(order.userId.toString());
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      await cartRepository.save(cart);
    }

    // Email de confirmación (fire and forget)
    userRepository.findById(order.userId).then((user) => {
      if (user) {
        emailService.sendOrderConfirmation(user.email, user.name, order).catch(console.error);
      }
    }).catch(console.error);
  }
}
