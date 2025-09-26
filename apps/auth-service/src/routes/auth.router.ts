import express, { Router } from 'express';

import {
  addUserAddress,
  changeUserPassword,
  createNewShop,
  createStripeConnectLink,
  deleteUserAddress,
  getSeller,
  getShopInfo,
  getShopInfoById,
  getUser,
  getUserAddresses,
  logoutUser,
  logoutSeller,
  sellerLogin,
  SellerRegistration,
  setDefaultAddress,
  updateShopCoverBanner,
  updateShopInfo,
  updateUserAddress,
  UserForgotPassword,
  UserLogin,
  RefreshToken,
  RefreshSellerToken,
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
router.post('/refresh-seller-token', RefreshSellerToken);
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
router.post('/logout-seller', logoutSeller);

// User Address Management
router.get('/user-addresses', isAuthenticated, getUserAddresses);
router.post('/user-addresses', isAuthenticated, addUserAddress);
router.put('/user-addresses/:id', isAuthenticated, updateUserAddress);
router.delete('/user-addresses/:id', isAuthenticated, deleteUserAddress);
router.patch('/user-addresses/:id/set-default', isAuthenticated, setDefaultAddress);

// User Password Management
router.put('/change-password', isAuthenticated, changeUserPassword);

// Shop Management
router.get('/shop-info/:shopId', getShopInfoById);
router.get('/shop-info', isAuthenticated, isSeller, getShopInfo);
router.put('/shop-info', isAuthenticated, isSeller, updateShopInfo);
router.put('/shop-cover-banner', isAuthenticated, isSeller, updateShopCoverBanner);

export default router;
