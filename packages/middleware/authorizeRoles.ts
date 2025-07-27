import { Response, NextFunction } from 'express';

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'seller') {
    return res.status(403).json({ message: 'Unauthorized! You are not authorized to access this resource.' });
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (req.role !== 'user') {
    return res.status(403).json({ message: 'Unauthorized! You are not authorized to access this resource.' });
  }
  next();
};
