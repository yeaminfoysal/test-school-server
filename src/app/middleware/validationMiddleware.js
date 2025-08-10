"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const ApiError_1 = require("../utils/ApiError");
const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errorMessage = error.details
                .map(detail => detail.message)
                .join(', ');
            throw new ApiError_1.ApiError(400, errorMessage);
        }
        next();
    };
};
exports.validateRequest = validateRequest;
