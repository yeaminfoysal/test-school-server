"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("./userController");
const user_model_1 = require("./user.model");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
// Protected routes - Admin only
// router.use(authenticate);
router.get('/', (0, authMiddleware_1.authorize)(user_model_1.UserRole.ADMIN), userController_1.getUsers);
router.get('/dashboard/stats', (0, authMiddleware_1.authorize)(user_model_1.UserRole.ADMIN), userController_1.getDashboardStats);
router.get('/:id', userController_1.getUserById);
router.patch('/:id/role', (0, authMiddleware_1.authorize)(user_model_1.UserRole.ADMIN), userController_1.updateUserRole);
router.delete('/:id', (0, authMiddleware_1.authorize)(user_model_1.UserRole.ADMIN), userController_1.deleteUser);
exports.default = router;
