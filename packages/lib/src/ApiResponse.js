"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
/**
 * Custom class for json response to make sure send response
 * in correct format
 */
class ApiResponse {
    constructor(statusCode, data, message) {
        this.message = "Success";
        this.statusCode = statusCode;
        this.data = data;
        this.message =
            message !== null && message !== void 0 ? message : "Success";
        this.success = this.statusCode < 400;
    }
}
exports.ApiResponse = ApiResponse;
