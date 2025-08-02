import express, { Router } from 'express';

import {
  createNewShop,
  createStripeConnectLink,
  getSeller,
  getUser,
  sellerLogin,
  SellerRegistration,
  UserForgotPassword,
  UserLogin,
  RefreshToken,
  UserRegistration,
  UserResetPassword,
  UserVerification,
  UserVerifyForgotPasswordOTP,
  verifySeller,
} from '../controllers/auth.controller';
import isAuthenticated from '@packages/middleware/isAuthenticated';
import { isSeller } from '@packages/middleware/authorizeRoles';

const router: Router = express.Router();

router.post('/user-registration', UserRegistration);
router.post('/verify-user', UserVerification);
router.post('/login-user', UserLogin);
router.post('/refresh-token', RefreshToken);
router.get('/logged-in-user', isAuthenticated, getUser);
router.post('/forgot-password-user', UserForgotPassword);
router.post('/verify-forgot-password-otp', UserVerifyForgotPasswordOTP);
router.post('/reset-password-user', UserResetPassword);
router.post('/seller-registration', SellerRegistration);
router.post('/verify-seller', verifySeller);
router.post('/create-shop', createNewShop);
router.post('/login-seller', sellerLogin);
router.get('/logged-in-seller', isAuthenticated, isSeller, getSeller);
router.post('/create-stripe-link', createStripeConnectLink);

export default router;
