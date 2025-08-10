"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Question = exports.Competency = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_model_1 = require("../user/user.model");
const competencySchema = new mongoose_1.Schema({
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
const questionSchema = new mongoose_1.Schema({
    competency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Competency',
        required: [true, 'Competency is required'],
    },
    level: {
        type: String,
        enum: Object.values(user_model_1.CompetencyLevel).filter(level => level !== user_model_1.CompetencyLevel.NONE),
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
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
});
// Validation for options array
questionSchema.path('options').validate(function (options) {
    return options && options.length >= 2 && options.length <= 6;
}, 'Question must have between 2 and 6 options');
// Validation for correct answer
questionSchema.path('correctAnswer').validate(function (correctAnswer) {
    return correctAnswer < this.options.length;
}, 'Correct answer index must be valid for the given options');
// Indexes for performance
competencySchema.index({ code: 1 });
competencySchema.index({ name: 1 });
questionSchema.index({ competency: 1, level: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ createdBy: 1 });
exports.Competency = mongoose_1.default.model('Competency', competencySchema);
exports.Question = mongoose_1.default.model('Question', questionSchema);
