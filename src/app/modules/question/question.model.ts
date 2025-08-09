import mongoose, { Schema, Document } from 'mongoose';
import { CompetencyLevel } from '../user/user.model';

export interface ICompetency extends Document {
  name: string;
  description: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion extends Document {
  competency: mongoose.Types.ObjectId | ICompetency;
  level: CompetencyLevel;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const competencySchema = new Schema<ICompetency>({
  name: {
    type: String,
    required: [true, 'Competency name is required'],
    trim: true,
    maxlength: [100, 'Competency name cannot exceed 100 characters'],
  },
  description: {
    type: String,
    required: [true, 'Competency description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  code: {
    type: String,
    required: [true, 'Competency code is required'],
    unique: true,
    uppercase: true,
    minlength: [2, 'Code must be at least 2 characters'],
    maxlength: [10, 'Code cannot exceed 10 characters'],
  },
}, {
  timestamps: true,
});

const questionSchema = new Schema<IQuestion>({
  competency: {
    type: Schema.Types.ObjectId,
    ref: 'Competency',
    required: [true, 'Competency is required'],
  },
  level: {
    type: String,
    enum: Object.values(CompetencyLevel).filter(level => level !== CompetencyLevel.NONE),
    required: [true, 'Level is required'],
  },
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    minlength: [10, 'Question must be at least 10 characters long'],
    maxlength: [1000, 'Question cannot exceed 1000 characters'],
  },
  options: [{
    type: String,
    required: true,
    trim: true,
    maxlength: [200, 'Option cannot exceed 200 characters'],
  }],
  correctAnswer: {
    type: Number,
    required: [true, 'Correct answer index is required'],
    min: [0, 'Correct answer index must be at least 0'],
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: [1000, 'Explanation cannot exceed 1000 characters'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

// Validation for options array
questionSchema.path('options').validate(function (options: string[]) {
  return options && options.length >= 2 && options.length <= 6;
}, 'Question must have between 2 and 6 options');

// Validation for correct answer
questionSchema.path('correctAnswer').validate(function (correctAnswer: number) {
  return correctAnswer < this.options.length;
}, 'Correct answer index must be valid for the given options');

// Indexes for performance
competencySchema.index({ code: 1 });
competencySchema.index({ name: 1 });

questionSchema.index({ competency: 1, level: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ createdBy: 1 });

export const Competency = mongoose.model<ICompetency>('Competency', competencySchema);
export const Question = mongoose.model<IQuestion>('Question', questionSchema);