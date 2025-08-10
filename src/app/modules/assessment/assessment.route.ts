import express from 'express';
import { submitAssessment } from './assessment.controller';

export const AssessmentRoute = express.Router();

AssessmentRoute.post('/submit', submitAssessment);