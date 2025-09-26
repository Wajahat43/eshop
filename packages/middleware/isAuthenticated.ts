import prisma from '@packages/libs/prisma';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;

type Role = 'user' | 'seller';

type DecodedToken = {
  id: string;
  role?: string;
};

const TOKEN_COOKIE: Record<Role, string> = {
  user: 'access_token',
  seller: 'seller_access_token',
};

const parseRoleHeader = (value: string | string[] | undefined): Role | null => {
  if (!value) {
    return null;
  }

  const raw = Array.isArray(value) ? value[0] : value;
  const normalized = raw?.toString().trim().toLowerCase();

  if (normalized === 'user' || normalized === 'seller') {
    return normalized;
  }

  return null;
};

const resolveRequestedRole = (req: any, allowedRoles: Role[]): Role | null => {
  const headerValue = req.headers['x-auth-actor'] ?? req.headers['x-auth-role'] ?? req.headers['x-client-role'];
  const headerRole = parseRoleHeader(headerValue as string | string[] | undefined);

  if (headerRole) {
    return allowedRoles.includes(headerRole) ? headerRole : null;
  }

  for (const candidate of allowedRoles) {
    const cookieName = TOKEN_COOKIE[candidate];
    if (req.cookies?.[cookieName]) {
      return candidate;
    }
  }

  return null;
};

const loadAccountByRole = async (role: Role, id: string) => {
  if (role === 'user') {
    return prisma.users.findUnique({ where: { id } });
  }

  return prisma.sellers.findUnique({ where: { id }, include: { shop: true } });
};

const createIsAuthenticated = (allowedRoles: Role[] = ['user', 'seller']) => {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const role = resolveRequestedRole(req, allowedRoles);
      console.log('Resolved to role: ', role);
      if (!role) {
        return res.status(401).json({ message: 'Unauthorized! No matching session.' });
      }

      const tokenName = TOKEN_COOKIE[role];
      const token = req.cookies?.[tokenName];

      if (!token) {
        return res.status(401).json({ message: 'Unauthorized! Session token missing.' });
      }

      const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as DecodedToken;

      if (!decoded?.id || (decoded.role && decoded.role !== role)) {
        return res.status(401).json({ message: 'Unauthorized! Invalid session token.' });
      }

      const account = await loadAccountByRole(role, decoded.id);

      if (!account) {
        return res.status(403).json({ message: 'Account not found!' });
      }

      if (role === 'user') {
        req.user = account;
      } else {
        req.seller = account;
      }

      req.role = role;
      req.roles = { ...(req.roles || {}), [role]: true };

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Unauthorized! Token expired or invalid.' });
    }
  };
};

export const isUserAuthenticated = createIsAuthenticated(['user']);
export const isSellerAuthenticated = createIsAuthenticated(['seller']);

const isAuthenticated = createIsAuthenticated();

export default isAuthenticated;
