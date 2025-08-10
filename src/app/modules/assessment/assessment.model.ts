import mongoose, { Schema, Document } from 'mongoose';


export interface IAssessment {
    student: mongoose.Types.ObjectId,
    totalCorrect: number,
    level: string;
    totalQuestions: number;
}

const assessmentSchema = new Schema<IAssessment>({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    totalCorrect: {
        type: Number,
        required: [true, 'Total correct is required']
    },
    totalQuestions: {
        type: Number,
        required: [true, 'Total questions is required']
    },
    level: {
        type: String,
        required: [true, 'Level code is required'],
        uppercase: true
    },
}, {
    timestamps: true,
    versionKey: false
})

// Validation for options array
// questionSchema.path('options').validate(function (options: string[]) {
//   return options && options.length >= 2 && options.length <= 6;
// }, 'Question must have between 2 and 6 options');

// // Validation for correct answer
// questionSchema.path('correctAnswer').validate(function (correctAnswer: number) {
//   return correctAnswer < this.options.length;
// }, 'Correct answer index must be valid for the given options');

// // Indexes for performance
// competencySchema.index({ code: 1 });
// competencySchema.index({ name: 1 });

// questionSchema.index({ competency: 1, level: 1 });
// questionSchema.index({ isActive: 1 });
// questionSchema.index({ createdBy: 1 });

export const Assessment = mongoose.model<IAssessment>('Assessment', assessmentSchema);