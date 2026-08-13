import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';
import { sendResponse } from '../utils/response';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

const paymentService = new PaymentService();

/** POST /api/payments/create-preference
 *  Requiere autenticación. Crea la preferencia en MP y devuelve init_point.
 */
export const createPreference = catchAsync(async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  if (!userId) throw new AppError('No autenticado', 401);

  const { shippingAddress, items } = req.body;
  const result = await paymentService.createPreference(userId, shippingAddress, items);
  sendResponse(res, 200, result, 'Preferencia creada');
});

/** POST /api/payments/webhook
 *  Endpoint público que recibe notificaciones de Mercado Pago.
 *  MP envía ?type=payment&data.id=<paymentId>
 */
export const webhook = catchAsync(async (req: Request, res: Response) => {
  // Mercado Pago puede enviar la info en el body (Webhooks) o en query params (IPN)
  const type = req.body?.type || req.query?.type || req.query?.topic;
  const dataId = req.body?.data?.id || req.query?.['data.id'] || req.query?.id;

  if (type !== 'payment' || !dataId) {
    res.sendStatus(200);
    return;
  }

  const paymentId = dataId.toString();

  // Respondemos 200 inmediatamente a MP (SLA de 5s) y procesamos en background
  res.sendStatus(200);
  paymentService.processWebhook(paymentId).catch(console.error);
});
