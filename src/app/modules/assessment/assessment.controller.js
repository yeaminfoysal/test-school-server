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
exports.submitAssessment = void 0;
const assessment_model_1 = require("./assessment.model");
const user_model_1 = __importDefault(require("../user/user.model"));
const submitAssessment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const assessment = req.body;
        const correctAnswer = req.body.totalCorrect;
        const totalQuestions = req.body.totalQuestions;
        const student = req.body.student;
        const level = req.body.level;
        const correctRate = (correctAnswer / totalQuestions) * 100;
        if (!student) {
            return res.status(400).json({ success: false, message: "Missing student ID" });
        }
        let newLevel = null;
        if (correctRate >= 25 && correctRate <= 75 && !level) {
            newLevel = "A1";
        }
        else if (correctRate > 75 && !level) {
            newLevel = "A2";
        }
        else if (correctRate < 25 && level === "A2") {
            newLevel = "A2";
        }
        else if (correctRate >= 25 && correctRate <= 75 && level === "A2") {
            newLevel = "B1";
        }
        else if (correctRate > 75 && level === "A2") {
            newLevel = "B2";
        }
        else if (correctRate < 25 && level === "B2") {
            newLevel = "B2";
        }
        else if (correctRate >= 25 && correctRate <= 75 && level === "B2") {
            newLevel = "C1";
        }
        else if (correctRate > 75 && level === "B2") {
            newLevel = "C2";
        }
        if (newLevel) {
            yield user_model_1.default.findByIdAndUpdate(student, { $set: { currentLevel: newLevel } }, { new: true });
        }
        const result = yield assessment_model_1.Assessment.create(assessment);
        res.status(200).json({
            success: true,
            data: result,
            updatedLevel: newLevel,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : "Server error",
        });
    }
});
exports.submitAssessment = submitAssessment;
