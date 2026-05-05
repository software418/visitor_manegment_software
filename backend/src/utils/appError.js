class AppError extends Error {
  constructor(message, statusCode, errorcode, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errorcode = errorcode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
    }
}

export default AppError;