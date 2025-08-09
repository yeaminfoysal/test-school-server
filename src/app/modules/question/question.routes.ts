import express from 'express';
import { getQuestions } from './question.controller';

const router = express.Router();

router.get('/', getQuestions);

export default router;