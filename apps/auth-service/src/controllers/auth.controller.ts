import { NextFunction, Request, Response } from 'express';

import { AuthError, ValidationError } from '@packages/error-handler';
import prisma from '@packages/libs/prisma';
import {
  checkOTPRestrictions,
  handleForgotPassword,
  sendOTP,
  trackOTPRequests,
  validateRegistrationData,
  verifyForgotPasswordOTP,
  verifyOTP,
} from '../utils/auth.helper';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setCookie } from '../utils/cookies/setCookie';

//Register a new user.
export const UserRegistration = async (request: Request, response: Response, next: NextFunction) => {
  try {
    validateRegistrationData(request.body, 'user');

    const { name, email } = request.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError('User has already signed up with this email.'));
    }

    await checkOTPRestrictions(email, next);
    await trackOTPRequests(email, next);
    await sendOTP(name, email, 'user-activation-mail');

    response.status(200).json({
      message: 'OTP sent successfully! Please verify your account',
    });
  } catch (error) {
    next(error);
  }
};

//verify user
export const UserVerification = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, otp, password, name } = request.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError('Missing required fields!'));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AuthError('User has already signed up with this email.'));
    }

    await verifyOTP(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    response.status(200).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (error) {
    return next(error);
  }
};

//Login User
export const UserLogin = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return next(new ValidationError('Missing required fields!'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError('User not found!'));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password ?? '');
    if (!isPasswordValid) {
      return next(new AuthError('Invalid password!'));
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      },
    );

    const refreshToken = jwt.sign(
      {
        id: user.id,
        role: 'user',
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: '15m',
      },
    );

    // store the tokens in httpOnly secure cookie
    setCookie(response, 'access_token', accessToken);
    setCookie(response, 'refresh_token', refreshToken);

    response.status(200).json({
      success: true,
      message: 'User logged in successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//Forgot password
export const UserForgotPassword = async (request: Request, response: Response, next: NextFunction) => {
  await handleForgotPassword(request, response, next, 'user');
};

//Verify user forgot password otp
export const UserVerifyForgotPasswordOTP = async (request: Request, response: Response, next: NextFunction) => {
  await verifyForgotPasswordOTP(request, response, next);
};

//Reset User Password
export const UserResetPassword = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = request.body;
    if (!email || !otp || !newPassword) {
      return next(new ValidationError('Missing required fields!'));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new AuthError('User not found!'));
    }

    const isPasswordValid = await bcrypt.compare(newPassword, user.password ?? '');
    if (isPasswordValid) {
      return next(new ValidationError('New password cannot be the same as the old one!'));
    }

    await verifyOTP(email, otp, next);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    response.status(200).json({
      success: true,
      message: 'Password reset successfully!',
    });
  } catch (error) {
    return next(error);
  }
};
