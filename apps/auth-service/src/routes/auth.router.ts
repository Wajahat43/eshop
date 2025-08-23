import express, { Router } from 'express';

import {
  addUserAddress,
  changeUserPassword,
  createNewShop,
  createStripeConnectLink,
  deleteUserAddress,
  getSeller,
  getUser,
  getUserAddresses,
  logoutUser,
  sellerLogin,
  SellerRegistration,
  setDefaultAddress,
  updateUserAddress,
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
router.post('/logout', logoutUser);

// User Address Management
router.get('/user-addresses', isAuthenticated, getUserAddresses);
router.post('/user-addresses', isAuthenticated, addUserAddress);
router.put('/user-addresses/:id', isAuthenticated, updateUserAddress);
router.delete('/user-addresses/:id', isAuthenticated, deleteUserAddress);
router.patch('/user-addresses/:id/set-default', isAuthenticated, setDefaultAddress);

// User Password Management
router.put('/change-password', isAuthenticated, changeUserPassword);

export default router;
