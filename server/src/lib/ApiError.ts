class ApiError extends Error {
  statusCode?: number;
  data?: any;
  message: string;
  success?: boolean;
  errors?: any[];

  constructor(
    statusCode: number,
    message: string,
    errors?: [],
    stack = ""
  ) {
    super();
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    if (process.env.NODE_ENV == "development") {
      if (stack) this.stack = stack;
      else Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = ""
    }
  }
}

export { ApiError };
