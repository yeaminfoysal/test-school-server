"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const authMiddleware_1 = require("../../middleware/authMiddleware");
// import { validateRequest } from '../../middleware/validationMiddlewar
const authValidations_1 = require("../../validations/authValidations");
const validationMiddleware_1 = require("../../middleware/validationMiddleware");
const router = express_1.default.Router();
// Public routes
router.post('/register', (0, validationMiddleware_1.validateRequest)(authValidations_1.registerValidation), auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/verify-email', (0, validationMiddleware_1.validateRequest)(authValidations_1.verifyEmailValidation), auth_controller_1.verifyEmail);
router.post('/resend-otp', (0, validationMiddleware_1.validateRequest)(authValidations_1.resendOTPValidation), auth_controller_1.resendOTP);
router.post('/forgot-password', (0, validationMiddleware_1.validateRequest)(authValidations_1.forgotPasswordValidation), auth_controller_1.forgotPassword);
router.post('/reset-password', (0, validationMiddleware_1.validateRequest)(authValidations_1.resetPasswordValidation), auth_controller_1.resetPassword);
router.post('/refresh-token', (0, validationMiddleware_1.validateRequest)(authValidations_1.refreshTokenValidation), auth_controller_1.refreshToken);
// Protected routes
router.post('/logout', authMiddleware_1.authenticate, auth_controller_1.logout);
router.get('/profile', authMiddleware_1.authenticate, auth_controller_1.getProfile);
exports.default = router;
