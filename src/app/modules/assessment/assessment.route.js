"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentRoute = void 0;
const express_1 = __importDefault(require("express"));
const assessment_controller_1 = require("./assessment.controller");
exports.AssessmentRoute = express_1.default.Router();
exports.AssessmentRoute.post('/submit', assessment_controller_1.submitAssessment);
