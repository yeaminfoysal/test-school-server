import { NextFunction, Request, Response } from "express";
import { Assessment } from "./assessment.model";
import userModel from "../user/user.model";

export const submitAssessment = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const assessment = req.body;
        const correctAnswer = req.body.totalCorrect;
        const totalQuestions = req.body.totalQuestions;
        const student = req.body.student as string | undefined;
        const level = req.body.level as string | undefined;
        const correctRate = (correctAnswer / totalQuestions) * 100;

        if (!student) {
            return res.status(400).json({ success: false, message: "Missing student ID" });
        }

        let newLevel: string | null = null;

        if (correctRate >= 25 && correctRate <= 75 && !level) {
            newLevel = "A1";
        } else if (correctRate > 75 && !level) {
            newLevel = "A2";
        } else if (correctRate < 25 && level === "A2") {
            newLevel = "A2";
        } else if (correctRate >= 25 && correctRate <= 75 && level === "A2") {
            newLevel = "B1";
        } else if (correctRate > 75 && level === "A2") {
            newLevel = "B2";
        } else if (correctRate < 25 && level === "B2") {
            newLevel = "B2";
        } else if (correctRate >= 25 && correctRate <= 75 && level === "B2") {
            newLevel = "C1";
        } else if (correctRate > 75 && level === "B2") {
            newLevel = "C2";
        }

        if (newLevel) {
            await userModel.findByIdAndUpdate(student, { $set: { currentLevel: newLevel } }, { new: true });
        }

        const result = await Assessment.create(assessment);

        res.status(200).json({
            success: true,
            data: result,
            updatedLevel: newLevel,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
};
