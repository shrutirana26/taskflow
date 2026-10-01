const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose bad ObjectId / CastError -> 400 as per spec: "400 → validation/bad request/invalid ObjectId"
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ObjectId format for field: ${err.path || 'id'}`;
  }

  // Mongoose duplicate key -> 400 as per spec: "Duplicate email must return a clear 400 error."
  if (err.code === 11000) {
    statusCode = 400;
    if (err.keyValue && err.keyValue.email) {
      message = 'Email already registered. Please use another email or log in.';
    } else {
      const keys = Object.keys(err.keyValue || {});
      message = `Duplicate value for field: ${keys.join(', ')}. Please use another value.`;
    }
  }

  // Mongoose validation error -> 400
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
  }

  // JWT errors -> 401
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
