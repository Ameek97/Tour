// custom error class

class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // sets the message and does stack stuff
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

