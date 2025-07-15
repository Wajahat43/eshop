import crypto from 'crypto';
import { NextFunction } from 'express';
import { ValidationError } from '../../../../packages/error-handler';
import redis from '../../../../packages/libs/redis';
import { sendEmail } from './sendMail';

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const validateRegistrationData = (data: any, userType: 'user' | 'seller'): void => {
  const { name, email, password, phone_number, country } = data;
  if (!name || !email || !password || (userType == 'seller' && (!phone_number || !country))) {
    throw new ValidationError('Missing required fields!');
  }
  if (!emailRegex.test(email)) {
    throw new ValidationError('Invalid email format!');
  }
};

export const checkOTPRestrictions = async (email: string, next: NextFunction) => {
  if (await redis.get(`otp_lock:${email}`)) {
    return next(new ValidationError('Account locked due to multiple failed attempts! Try again after 30 minutes.'));
  }

  if (await redis.get(`top_spam_lock:${email}`)) {
    return next(new ValidationError('Too many otp requests. Please wait an hour before requesting again.'));
  }

  if (await redis.get(`otp_cooldown${email}`)) {
    return next(new ValidationError('Please wait 1 minute before requesting a new otp.'));
  }
};

export const trackOTPRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequests = parseInt((await redis.get(otpRequestKey)) || '0');

  if (otpRequests >= 3) {
    await redis.set(`otp_spam_lock:${email}`, 'locked', 'EX', 3600); //Lock for an hour
    return next(new ValidationError('Too many OTP requests. Please wait 1 hour before requesting again.'));
  } else {
    await redis.set(`otp_lock:${email}`, 'locked', 'EX', 60); //
  }

  await redis.set(otpRequestKey, otpRequests + 1, 'EX', 3600);
};

export const sendOTP = async (name: string, email: string, template: string) => {
  const otp = crypto.randomInt(1000, 9999).toString();

  await sendEmail(email, 'Verify your Email', template, { name, otp });
  //Store to Redis
  await redis.set(`otp:${email}`, otp, 'EX', 300);
  await redis.set(`otp_cooldown:${email}`, 'true', 'EX', 60); //Allow sending only single otp in a minute.
};
