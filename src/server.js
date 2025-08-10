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
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mongoURI = process.env.MONGODB_URI;
        const conn = yield mongoose_1.default.connect(mongoURI);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
        process.exit(1);
    }
});
exports.connectDB = connectDB;
// Handle MongoDB connection events
mongoose_1.default.connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
});
mongoose_1.default.connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('⚠️ Mongoose disconnected');
});
// Graceful shutdown
process.on('SIGINT', () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
    console.log('✅ MongoDB connection closed through app termination');
    process.exit(0);
}));
