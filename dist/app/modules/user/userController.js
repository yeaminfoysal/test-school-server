"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = exports.deleteUser = exports.updateUserRole = exports.getUserById = exports.getUsers = void 0;
const user_model_1 = __importStar(require("../../modules/user/user.model"));
// import Assessment from '../models/Assessment';
// import Certificate from '../models/Certificate';
const ApiResponse_1 = require("../../utils/ApiResponse");
const ApiError_1 = require("../../utils/ApiError");
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const role = req.query.role;
        const query = {};
        if (role && Object.values(user_model_1.UserRole).includes(role)) {
            query.role = role;
        }
        const skip = (page - 1) * limit;
        const total = yield user_model_1.default.countDocuments(query);
        const pages = Math.ceil(total / limit);
        const users = yield user_model_1.default.find(query)
            .select('-password -refreshTokens -emailVerificationToken -passwordResetToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json(new ApiResponse_1.PaginatedResponse(200, users, { page, limit, total, pages }));
    }
    catch (error) {
        next(error);
    }
});
exports.getUsers = getUsers;
const getUserById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.default.findById(id)
            .select('-password -refreshTokens -emailVerificationToken -passwordResetToken');
        if (!user) {
            throw new ApiError_1.ApiError(404, 'User not found');
        }
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { user }));
    }
    catch (error) {
        next(error);
    }
});
exports.getUserById = getUserById;
const updateUserRole = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!Object.values(user_model_1.UserRole).includes(role)) {
            throw new ApiError_1.ApiError(400, 'Invalid role');
        }
        const user = yield user_model_1.default.findByIdAndUpdate(id, { role }, { new: true, runValidators: true }).select('-password -refreshTokens -emailVerificationToken -passwordResetToken');
        if (!user) {
            throw new ApiError_1.ApiError(404, 'User not found');
        }
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { user }, 'User role updated successfully'));
    }
    catch (error) {
        next(error);
    }
});
exports.updateUserRole = updateUserRole;
const deleteUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.default.findById(id);
        if (!user) {
            throw new ApiError_1.ApiError(404, 'User not found');
        }
        // Prevent deletion of admin users (optional safeguard)
        if (user.role === user_model_1.UserRole.ADMIN) {
            throw new ApiError_1.ApiError(403, 'Cannot delete admin users');
        }
        // // Delete related data
        // await Assessment.deleteMany({ user: id });
        // await Certificate.deleteMany({ user: id });
        yield user_model_1.default.findByIdAndDelete(id);
        res.status(200).json(new ApiResponse_1.ApiResponse(200, { message: 'User deleted successfully' }));
    }
    catch (error) {
        next(error);
    }
});
exports.deleteUser = deleteUser;
const getDashboardStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get total counts
        const totalUsers = yield user_model_1.default.countDocuments();
        // const totalAssessments = await Assessment.countDocuments();
        // const totalCertificates = await Certificate.countDocuments();
        // Calculate completion rate
        // const completedAssessments = await Assessment.countDocuments({ isCompleted: true });
        // const completionRate = totalAssessments > 0 ? (completedAssessments / totalAssessments) * 100 : 0;
        // Get level distribution
        const levelDistribution = yield user_model_1.default.aggregate([
            {
                $group: {
                    _id: '$currentLevel',
                    count: { $sum: 1 }
                }
            }
        ]);
        const levelDistributionObj = Object.values(user_model_1.CompetencyLevel).reduce((acc, level) => {
            acc[level] = 0;
            return acc;
        }, {});
        levelDistribution.forEach(item => {
            if (item._id && Object.values(user_model_1.CompetencyLevel).includes(item._id)) {
                levelDistributionObj[item._id] = item.count;
            }
        });
        const stats = {
            totalUsers,
            // totalAssessments,
            // totalCertificates,
            // completionRate: Math.round(completionRate),
            levelDistribution: levelDistributionObj,
        };
        res.status(200).json(new ApiResponse_1.ApiResponse(200, stats, 'Dashboard stats retrieved successfully'));
    }
    catch (error) {
        next(error);
    }
});
exports.getDashboardStats = getDashboardStats;
