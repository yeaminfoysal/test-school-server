import { NextFunction, Request, Response } from "express";
import { Question } from "./question.model";

export const getQuestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentLevel = req.query.currentLevel as string | undefined;

    // Level mapping
    const levelMap: Record<string, [string, string]> = {
      none: ["A1", "A2"],
      A2: ["B1", "B2"],
      B2: ["C1", "C2"],
    };

    const levels: string[] = levelMap[currentLevel || ""] || [];

    if (!levels.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing currentLevel",
      });
    }

    // Fetch random 11 from each level in parallel
    const [questionsLevel1, questionsLevel2] = await Promise.all([
      Question.aggregate([
        { $match: { level: levels[0] } },
        { $sample: { size: 11 } },
      ]),
      Question.aggregate([
        { $match: { level: levels[1] } },
        { $sample: { size: 11 } },
      ]),
    ]);

    // Merge into one array
    const allQuestions = [...questionsLevel1, ...questionsLevel2];

    res.status(200).json({
      success: true,
      levels,
      total: allQuestions.length,
      data: allQuestions, // ✅ single array with all questions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Server error",
    });
  }


};