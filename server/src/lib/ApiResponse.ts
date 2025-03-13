class ApiResponse {
  statusCode?: number;
  data?: any;
  message: string = "Success";
  success?: boolean;

  constructor(statusCode: number, data: any, message?: string) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message ?? "Success";
    this.success = this.statusCode < 400;
  }
}

export { ApiResponse };
