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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuestions = void 0;
const question_model_1 = require("./question.model");
const getQuestions = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentLevel = req.query.currentLevel;
        // Level mapping
        const levelMap = {
            none: ["A1", "A2"],
            A2: ["B1", "B2"],
            B2: ["C1", "C2"],
        };
        const levels = levelMap[currentLevel || ""] || [];
        if (!levels.length) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing currentLevel",
            });
        }
        // Fetch random 11 from each level in parallel
        const [questionsLevel1, questionsLevel2] = yield Promise.all([
            question_model_1.Question.aggregate([
                { $match: { level: levels[0] } },
                { $sample: { size: 11 } },
            ]),
            question_model_1.Question.aggregate([
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
});
exports.getQuestions = getQuestions;
