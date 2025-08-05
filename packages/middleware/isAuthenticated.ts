import prisma from '@packages/libs/prisma';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
const isAuthenticated = async (req: any, response: Response, next: NextFunction) => {
  try {
    const token =
      req.cookies['access_token'] || req.cookies['seller_access_token'] || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return response.status(401).json({ message: 'Unauthorized! No access token' });
    }

    //Verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as {
      id: string;
      role: 'user' | 'seller';
    };

    if (!decoded) {
      return response.status(403).json({ message: 'Forbidden! Invalid access token' });
    }

    const account =
      decoded.role === 'user'
        ? await prisma.users.findUnique({ where: { id: decoded.id } })
        : await prisma.sellers.findUnique({ where: { id: decoded.id }, include: { shop: true } });
    if (!account) {
      return response.status(403).json({ message: 'Account not found!' });
    }

    if (decoded.role === 'seller') {
      req.seller = account;
    } else {
      req.user = account;
      console.log('Set req.user to ', account);
    }

    req.role = decoded.role;
    return next();
  } catch (error) {
    return response.status(401).json({ message: 'Unauthorized! Token expired or invalid.' });
  }
};

export default isAuthenticated;
