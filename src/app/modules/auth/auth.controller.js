"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = exports.logout = exports.refreshToken = exports.resetPassword = exports.forgotPassword = exports.resendOTP = exports.verifyEmail = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../user/user.model"));
const ApiError_1 = require("../../utils/ApiError");
const ApiResponse_1 = require("../../utils/ApiResponse");
// import { sendEmail } from '../../services/emailService';
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const register = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, firstName, lastName, role } = req.body;
        // Check if user already exists
        const existingUser = yield user_model_1.default.findOne({ email: email.toLowerCase() });
        console.log(existingUser);
        if (existingUser) {
            throw new ApiError_1.ApiError(400, 'User with this email already exists');
        }
        // Create new user
        const user = new user_model_1.default({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role,
        });
        // Generate OTP for email verification
        const otp = user.generateOTP();
        yield user.save();
        // Send verification email
        // try {
        //     await sendEmail({
        //         to: user.email,
        //         subject: 'Verify Your Email - Test_School',
        //         html: `
        //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        //     <h2 style="color: #2563EB;">Welcome to Test_School!</h2>
        //     <p>Thank you for registering. Please verify your email address to complete your registration.</p>
        //     <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        //       <h3 style="color: #333; margin: 0;">Your verification code is:</h3>
        //       <h1 style="color: #2563EB; font-size: 32px; margin: 10px 0; letter-spacing: 4px;">${otp}</h1>
        //     </div>
        //     <p>This code will expire in 10 minutes.</p>
        //     <p>If you didn't create this account, please ignore this email.</p>
        //   </div>
        // `,
        //     });
        // } catch (emailError) {
        //     console.error('Failed to send verification email:', emailError);
        //     // Don't fail registration if email fails
        // }
        res.status(201).json(new ApiResponse_1.ApiResponse(201, { message: 'Registration successful. Please check your email for verification code.' }));
    }
    catch (error) {
        next(error);
    }
});
exports.register = register;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        // Find user and include password
        const user = yield user_model_1.default.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !(yield user.comparePassword(password))) {
            throw new ApiError_1.ApiError(401, 'Invalid email or password');
        }
        // if (!user.isEmailVerified) {
        //   throw new ApiError(401, 'Please verify your email before logging in');
        // }
        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        // Save refresh token
        user.refreshTokens.push(refreshToken);
        yield user.save();
        // Remove sensitive data
        const userResponse = user.toObject();
        // delete userResponse.password;
        // delete userResponse.refreshTokens;
        delete userResponse.emailVerificationToken;
        delete userResponse.emailVerificationExpires;
        delete userResponse.passwordResetToken;
        delete userResponse.passwordResetExpires;
        res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            user: userResponse,
            accessToken,
            refreshToken,
        }, 'Login successful'));
    }
    catch (error) {
        next(error);
    }
});
exports.login = login;
const verifyEmail = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, otp } = req.body;
        const user = yield user_model_1.default.findOne({
            email: email.toLowerCase(),
            emailVerificationToken: otp,
            emailVerificationExpires: { $gt: Date.now() },
        });
        if (!user) {
            throw new ApiError_1.ApiError(400, 'Invalid or expired verification code');
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        yield user.save();
        // Generate tokens for auto-login
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        user.refreshTokens.push(refreshToken);
        yield user.save();
        // Remove sensitive data
        const userResponse = user.toObject();
        // delete userResponse.password;
        // delete userResponse.refreshTokens;
        res.status(200).json(new ApiResponse_1.ApiResponse(200, {
            user: userResponse,
            accessToken,
            refreshToken,
        }, 'Email verified successfully'));
    }
    catch (error) {
        next(error);
    }
});
exports.verifyEmail = verifyEmail;
const resendOTP = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new ApiError_1.ApiError(404, 'User not found');
        }
        if (user.isEmailVerified) {
            throw new ApiError_1.ApiError(400, 'Email is already verified');
        }
        // Generate new OTP
        const otp = user.generateOTP();
        yield user.save();
        // Send verification email
        // try {
        //     await sendEmail({
        //         to: user.email,
        //         subject: 'New Verification Code - Test_School',
        //         html: `
        //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        //     <h2 style="color: #2563EB;">New Verification Code</h2>
        //     <p>Here's your new verification code:</p>
        //     <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        //       <h1 style="color: #2563EB; font-size: 32px; margin: 10px 0; letter-spacing: 4px;">${otp}</h1>
        //     </div>
        //     <p>This code will expire in 10 minutes.</p>
        //   </div>
        // `,
        //     });
        // } catch (emailError) {
        //     throw new ApiError(500, 'Failed to send verification email');
        // }
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { message: 'New verification code sent successfully' }));
    }
    catch (error) {
        next(error);
    }
});
exports.resendOTP = resendOTP;
const forgotPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new ApiError_1.ApiError(404, 'User not found');
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        yield user.save();
        // Send reset email
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        // try {
        //     await sendEmail({
        //         to: user.email,
        //         subject: 'Password Reset Request - Test_School',
        //         html: `
        //   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        //     <h2 style="color: #2563EB;">Password Reset Request</h2>
        //     <p>You requested a password reset. Click the button below to reset your password:</p>
        //     <div style="text-align: center; margin: 30px 0;">
        //       <a href="${resetUrl}" 
        //          style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
        //         Reset Password
        //       </a>
        //     </div>
        //     <p>Or copy and paste this link in your browser:</p>
        //     <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        //     <p>This link will expire in 10 minutes.</p>
        //     <p>If you didn't request this reset, please ignore this email.</p>
        //   </div>
        // `,
        //     });
        // } catch (emailError) {
        //     user.passwordResetToken = undefined;
        //     user.passwordResetExpires = undefined;
        //     await user.save();
        //     throw new ApiError(500, 'Failed to send password reset email');
        // }
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { message: 'Password reset link sent to your email' }));
    }
    catch (error) {
        next(error);
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = yield user_model_1.default.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });
        if (!user) {
            throw new ApiError_1.ApiError(400, 'Invalid or expired reset token');
        }
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.refreshTokens = []; // Invalidate all refresh tokens
        yield user.save();
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { message: 'Password reset successful' }));
    }
    catch (error) {
        next(error);
    }
});
exports.resetPassword = resetPassword;
const refreshToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new ApiError_1.ApiError(401, 'Refresh token is required');
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = yield user_model_1.default.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            throw new ApiError_1.ApiError(401, 'Invalid refresh token');
        }
        // Generate new access token
        const accessToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { accessToken }, 'Token refreshed successfully'));
    }
    catch (error) {
        next(error);
    }
});
exports.refreshToken = refreshToken;
const logout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.body;
        const user = req.user;
        if (refreshToken) {
            // Remove specific refresh token
            user.refreshTokens = user.refreshTokens.filter((token) => token !== refreshToken);
        }
        else {
            // Remove all refresh tokens (logout from all devices)
            user.refreshTokens = [];
        }
        yield user.save();
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { message: 'Logged out successfully' }));
    }
    catch (error) {
        next(error);
    }
});
exports.logout = logout;
const getProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { user }, 'Profile retrieved successfully'));
    }
    catch (error) {
        next(error);
    }
});
exports.getProfile = getProfile;
