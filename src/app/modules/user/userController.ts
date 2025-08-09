import { Request, Response, NextFunction } from 'express';
import User, { UserRole, CompetencyLevel } from '../../modules/user/user.model';
// import Assessment from '../models/Assessment';
// import Certificate from '../models/Certificate';
import { ApiResponse, PaginatedResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as UserRole;

    const query: any = {};
    if (role && Object.values(UserRole).includes(role)) {
      query.role = role;
    }

    const skip = (page - 1) * limit;
    const total = await User.countDocuments(query);
    const pages = Math.ceil(total / limit);

    const users = await User.find(query)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json(
      new PaginatedResponse(200, users, { page, limit, total, pages })
    );
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, { user })
    );
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!Object.values(UserRole).includes(role)) {
      throw new ApiError(400, 'Invalid role');
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens -emailVerificationToken -passwordResetToken');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.status(200).json(
      new ApiResponse(200, { user }, 'User role updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Prevent deletion of admin users (optional safeguard)
    if (user.role === UserRole.ADMIN) {
      throw new ApiError(403, 'Cannot delete admin users');
    }

    // // Delete related data
    // await Assessment.deleteMany({ user: id });
    // await Certificate.deleteMany({ user: id });
    
    await User.findByIdAndDelete(id);

    res.status(200).json(
      new ApiResponse(200, { message: 'User deleted successfully' })
    );
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    // const totalAssessments = await Assessment.countDocuments();
    // const totalCertificates = await Certificate.countDocuments();

    // Calculate completion rate
    // const completedAssessments = await Assessment.countDocuments({ isCompleted: true });
    // const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;

    // Get level distribution
    const levelDistribution = await User.aggregate([
      {
        $group: {
          _id: '$currentLevel',
          count: { $sum: 1 }
        }
      }
    ]);

    const levelDistributionObj: Record<CompetencyLevel, number> = Object.values(CompetencyLevel).reduce((acc, level) => {
      acc[level] = 0;
      return acc;
    }, {} as Record<CompetencyLevel, number>);

    levelDistribution.forEach(item => {
      if (item._id && Object.values(CompetencyLevel).includes(item._id)) {
        levelDistributionObj[item._id as CompetencyLevel] = item.count;
      }
    });

    const stats = {
      totalUsers,
      // totalAssessments,
      // totalCertificates,
      // completionRate: Math.round(completionRate),
      levelDistribution: levelDistributionObj,
    };

    res.status(200).json(
      new ApiResponse(200, stats, 'Dashboard stats retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};