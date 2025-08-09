import { NextFunction, Request, Response } from "express";
import { Question } from "./question.model";

export const getQuestions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const questions = await Question.find({});
        res.status(200).json({
            success:true,
            data:questions,
        }
        //   new PaginatedResponse(200, questions, { page, limit, total, pages })
        );
        /*
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
        */
    } catch (error) {
        next(error);
    }
};