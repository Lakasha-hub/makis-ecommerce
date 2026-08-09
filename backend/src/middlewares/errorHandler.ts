import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import mongoose from 'mongoose';

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Registra errores no operacionales: bugs internos, fallos de terceros
 * o cualquier error explícitamente marcado como crítico (isOperational = false).
 */
const logCriticalError = (err: any, req: Request): void => {
  console.error('========================================');
  console.error('[CRITICAL] NON-OPERATIONAL ERROR');
  console.error(`Timestamp : ${new Date().toISOString()}`);
  console.error(`Request   : ${req.method} ${req.originalUrl}`);
  console.error(`Message   : ${err.message}`);
  console.error('Stack     :', err.stack);
  console.error('========================================');
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;
  let isOperational = true;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  } else if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    details = err.issues.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
    }));
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Mongoose Validation Error';
    details = Object.values(err.errors).map((el) => el.message);
  } else if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    details = err.keyValue;
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.name === 'Error' && err.message) { // Generic Error thrown
    statusCode = 400;
    message = err.message;
  } else {
    // Error no clasificado: inesperado o de un servicio externo
    isOperational = false;
  }

  // Errores no operacionales: loggear como críticos
  if (!isOperational) {
    logCriticalError(err, req);
  }

  res.status(statusCode).json({
    success: false,
    message: !isOperational && isProduction ? 'Internal Server Error' : message,
    error: {
      statusCode,
      // En producción, no exponer detalles internos de errores críticos
      message: !isOperational && isProduction ? 'An unexpected error occurred' : err.message,
      details,
    }
  });
};
