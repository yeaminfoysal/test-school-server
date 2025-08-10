"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.notFound = void 0;
const ApiError_1 = require("../utils/ApiError");
const notFound = (req, res, next) => {
    const error = new ApiError_1.ApiError(404, `Route ${req.originalUrl} not found`);
    next(error);
};
exports.notFound = notFound;
const errorHandler = (err, req, res, next) => {
    let error = err;
    console.error(err);
    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Invalid resource ID';
        error = new ApiError_1.ApiError(400, message);
    }
    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ApiError_1.ApiError(400, message);
    }
    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = new ApiError_1.ApiError(400, message);
    }
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new ApiError_1.ApiError(401, message);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new ApiError_1.ApiError(401, message);
    }
    res.status(error.statusCode || 500).json(Object.assign({ success: false, message: error.message || 'Server Error' }, (process.env.NODE_ENV === 'development' && { stack: err.stack })));
};
exports.errorHandler = errorHandler;
