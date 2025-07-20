import { Response } from 'express';

export const setCookie = (response: Response, name: string, value: string) => {
  response.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
  });
};
