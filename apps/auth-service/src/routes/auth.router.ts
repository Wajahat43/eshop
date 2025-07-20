import express, { Router } from 'express';

import { UserForgotPassword, UserLogin, UserRegistration, UserResetPassword, UserVerification, UserVerifyForgotPasswordOTP } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/user-registration', UserRegistration);
router.post('/verify-user', UserVerification);
router.post('/login-user', UserLogin);
router.post('forgot-password-user', UserForgotPassword);
router.post('verify-forgot-password-otp', UserVerifyForgotPasswordOTP);
router.post('reset-password-user', UserResetPassword);

export default router;
