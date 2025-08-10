"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaginatedResponse = exports.ApiResponse = void 0;
class ApiResponse {
    constructor(statusCode, data, message = 'Success') {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}
exports.ApiResponse = ApiResponse;
class PaginatedResponse {
    constructor(statusCode, data, pagination, message = 'Success') {
        this.success = statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
        this.pagination = pagination;
    }
}
exports.PaginatedResponse = PaginatedResponse;
