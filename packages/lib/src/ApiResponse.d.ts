/**
 * Custom class for json response to make sure send response
 * in correct format
 */
declare class ApiResponse {
    statusCode?: number;
    data?: any;
    message: string;
    success?: boolean;
    constructor(statusCode: number, data: any, message?: string);
}
export { ApiResponse };
