import express, { Router } from 'express';

import {
  getUser,
  UserForgotPassword,
  UserLogin,
  UserRefreshToken,
  UserRegistration,
  UserResetPassword,
  UserVerification,
  UserVerifyForgotPasswordOTP,
} from '../controllers/auth.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';

const router: Router = express.Router();

router.post('/user-registration', UserRegistration);
router.post('/verify-user', UserVerification);
router.post('/login-user', UserLogin);
router.post('/refresh-token-user', UserRefreshToken);
router.post('/logged-in-user', isAuthenticated, getUser);
router.post('/forgot-password-user', UserForgotPassword);
router.post('/verify-forgot-password-otp', UserVerifyForgotPasswordOTP);
router.post('/reset-password-user', UserResetPassword);

export default router;
