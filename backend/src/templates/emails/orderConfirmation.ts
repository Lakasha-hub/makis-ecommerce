import { IOrder } from '../../models/Order';

export const orderConfirmationTemplate = (userName: string, orderData: IOrder): string => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  const orderId = (orderData as any)._id;
  const orderUrl = `${frontendUrl}/orders/${orderId}`;

  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <strong>${item.title}</strong><br>
        <span style="color: #666; font-size: 12px;">${item.specification}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #2c3e50; margin: 0;">¡Gracias por tu compra!</h1>
      </div>
      
      <div style="padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px;">
        <p>Hola <strong>${userName}</strong>,</p>
        <p>Hemos recibido tu orden <strong>#${orderId}</strong> exitosamente. A continuación te presentamos el resumen de tu compra:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f1f3f5;">
              <th style="padding: 10px; text-align: left;">Producto</th>
              <th style="padding: 10px; text-align: center;">Cant.</th>
              <th style="padding: 10px; text-align: right;">Precio</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 16px;">$${orderData.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
          <h3 style="margin-top: 0;">Dirección de envío:</h3>
          <p style="margin: 0;">
            ${orderData.shippingAddress.street}, ${orderData.shippingAddress.city}<br>
            ${orderData.shippingAddress.postalCode}, ${orderData.shippingAddress.country}
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${orderUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver mi orden</a>
        </div>
      </div>
      
      <div style="text-align: center; padding: 20px; color: #888; font-size: 12px;">
        <p>Makis E-commerce &copy; ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;
};
