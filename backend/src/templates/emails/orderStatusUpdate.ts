import { IOrder, OrderStatus } from '../../models/Order';

export const orderStatusUpdateTemplate = (userName: string, orderData: IOrder): string => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const orderId = (orderData as any)._id;
  const orderUrl = `${frontendUrl}/orders/${orderId}`;

  const statusMessages: Record<OrderStatus, string> = {
    pending: 'Tu orden está pendiente de pago.',
    paid: '¡Hemos recibido tu pago! Estamos preparando tu orden.',
    shipped: '¡Buenas noticias! Tu orden ha sido enviada y está en camino.',
    delivered: 'Tu orden ha sido entregada. ¡Esperamos que disfrutes tu compra!',
    cancelled: 'Tu orden ha sido cancelada.'
  };

  const message = statusMessages[orderData.status] || 'El estado de tu orden ha sido actualizado.';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #2c3e50; margin: 0;">Actualización de Orden #${orderId}</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hola <strong>${userName}</strong>,</p>
        <p style="font-size: 16px; margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 4px;">
          ${message}
        </p>
        
        <p>Para ver más detalles o el historial completo de tu orden, puedes acceder a nuestra plataforma:</p>
        
        <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
          <a href="${orderUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver mi orden</a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
        <p>Makis E-commerce &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
};
