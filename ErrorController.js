const AppError = require('./appError');
const { isDevelopment } = require('./Utils/env');

module.exports = (err, req, res, next) => {
  let error = err;
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  if (error.name === 'CastError') {
    error = new AppError('Invalid id', 400);
  } else if (error.name === 'ValidationError') {
    error = new AppError(error.message, 400);
  } else if (error.code === 11000) {
    error = new AppError('Duplicate value', 400);
  } else if (error.name === 'JsonWebTokenError') {
    error = new AppError('Login failed, please login again', 401);
  } else if (error.name === 'TokenExpiredError') {
    error = new AppError('The token has expired, please login again', 401);
  }

  if (isDevelopment()) {
    console.error('ERROR 💥', err);
    return res.status(error.statusCode || 500).json({
      status: error.status || 'error',
      message: error.message,
      stack: err.stack
    });
  }

  if (error.isOperational) {
    return res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  }

  console.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};
