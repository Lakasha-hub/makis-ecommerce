import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_for_development', (err, decoded) => {
      if (err) {
        return next(new AppError('Forbidden: Invalid Token', 403));
      }
      (req as any).user = decoded;
      next();
    });
  } else {
    return next(new AppError('Unauthorized: No token provided', 401));
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!roles.includes(userRole)) {
      return next(new AppError('Forbidden: Insufficient privileges', 403));
    }
    next();
  };
};
