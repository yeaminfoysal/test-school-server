import express from 'express';
import {
  register,
  login,
  verifyEmail,
  resendOTP,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getProfile,
} from './auth.controller';
import { authenticate } from '../../middleware/authMiddleware';
// import { validateRequest } from '../../middleware/validationMiddlewar
import {
  registerValidation,
  loginValidation,
  verifyEmailValidation,
  resendOTPValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  refreshTokenValidation,
} from '../../validations/authValidations';
import { validateRequest } from '../../middleware/validationMiddleware';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(registerValidation), register);
router.post('/login', login);
router.post('/verify-email', validateRequest(verifyEmailValidation), verifyEmail);
router.post('/resend-otp', validateRequest(resendOTPValidation), resendOTP);
router.post('/forgot-password', validateRequest(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordValidation), resetPassword);
router.post('/refresh-token', validateRequest(refreshTokenValidation), refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

export default router;