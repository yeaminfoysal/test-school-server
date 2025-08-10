import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../user/user.model';
import { ApiError } from '../../utils/ApiError';
import { ApiResponse } from '../../utils/ApiResponse';
import { AuthRequest } from '../../middleware/authMiddleware';
// import { sendEmail } from '../../services/emailService';

const generateTokens = (userId: string) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        console.log(existingUser);
        if (existingUser) {
            throw new ApiError(400, 'User with this email already exists');
        }

        // Create new user
        const user = new User({
            email: email.toLowerCase(),
            password,
            firstName,
            lastName,
            role,
        });

        // Generate OTP for email verification
        const otp = user.generateOTP();
        await user.save();

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

        res.status(201).json(
            new ApiResponse(201, { message: 'Registration successful. Please check your email for verification code.' })
        );
    } catch (error) {
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);

        // Find user and include password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw new ApiError(401, 'Invalid email or password');
        }

        // if (!user.isEmailVerified) {
        //   throw new ApiError(401, 'Please verify your email before logging in');
        // }

        // Generate tokens
        const { accessToken, refreshToken } = generateTokens(user._id.toString());

        // Save refresh token
        user.refreshTokens.push(refreshToken);
        await user.save();

        // Remove sensitive data
        const userResponse = user.toObject();
        // delete userResponse.password;
        // delete userResponse.refreshTokens;
        delete userResponse.emailVerificationToken;
        delete userResponse.emailVerificationExpires;
        delete userResponse.passwordResetToken;
        delete userResponse.passwordResetExpires;

        res.status(200).json(
            new ApiResponse(200, {
                user: userResponse,
                accessToken,
                refreshToken,
            }, 'Login successful')
        );
    } catch (error) {
        next(error);
    }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase(),
            emailVerificationToken: otp,
            emailVerificationExpires: { $gt: Date.now() },
        });

        if (!user) {
            throw new ApiError(400, 'Invalid or expired verification code');
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();

        // Generate tokens for auto-login
        const { accessToken, refreshToken } = generateTokens(user._id.toString());
        user.refreshTokens.push(refreshToken);
        await user.save();

        // Remove sensitive data
        const userResponse = user.toObject();
        // delete userResponse.password;
        // delete userResponse.refreshTokens;

        res.status(200).json(
            new ApiResponse(200, {
                user: userResponse,
                accessToken,
                refreshToken,
            }, 'Email verified successfully')
        );
    } catch (error) {
        next(error);
    }
};

export const resendOTP = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        if (user.isEmailVerified) {
            throw new ApiError(400, 'Email is already verified');
        }

        // Generate new OTP
        const otp = user.generateOTP();
        await user.save();

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

        res.status(200).json(
            new ApiResponse(200, { message: 'New verification code sent successfully' })
        );
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

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

        res.status(200).json(
            new ApiResponse(200, { message: 'Password reset link sent to your email' })
        );
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token, password } = req.body;

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            throw new ApiError(400, 'Invalid or expired reset token');
        }

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.refreshTokens = []; // Invalidate all refresh tokens
        await user.save();

        res.status(200).json(
            new ApiResponse(200, { message: 'Password reset successful' })
        );
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            throw new ApiError(401, 'Refresh token is required');
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
        const user = await User.findById(decoded.userId);

        if (!user || !user.refreshTokens.includes(refreshToken)) {
            throw new ApiError(401, 'Invalid refresh token');
        }

        // Generate new access token
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, { expiresIn: '15m' });

        res.status(200).json(
            new ApiResponse(200, { accessToken }, 'Token refreshed successfully')
        );
    } catch (error) {
        next(error);
    }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        const user = req.user!;

        if (refreshToken) {
            // Remove specific refresh token
            user.refreshTokens = user.refreshTokens.filter((token: any) => token !== refreshToken);
        } else {
            // Remove all refresh tokens (logout from all devices)
            user.refreshTokens = [];
        }

        await user.save();

        res.status(200).json(
            new ApiResponse(200, { message: 'Logged out successfully' })
        );
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const user = req.user!;

        res.status(200).json(
            new ApiResponse(200, { user }, 'Profile retrieved successfully')
        );
    } catch (error) {
        next(error);
    }
};