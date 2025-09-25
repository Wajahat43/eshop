import { Response } from 'express';

export const setCookie = (response: Response, name: string, value: string) => {
  response.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
  });
};
