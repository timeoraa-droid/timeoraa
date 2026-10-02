const notFound = (req, res, next) => {
  const error = new Error(`Resource Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const errorStatus = Number(err.status || err.statusCode);
  const statusCode = Number.isInteger(errorStatus) && errorStatus >= 400 && errorStatus < 600
    ? errorStatus
    : (res.statusCode === 200 ? 500 : res.statusCode);
  const isAuthError = err.message && (
    err.message.includes('Not authorized') ||
    err.message.includes('token') ||
    err.message.includes('JWT') ||
    err.message.includes('jwt')
  );

  const safeMessage = isAuthError
    ? 'Authentication failed'
    : (err.name === 'ValidationError'
      ? Object.values(err.errors).map(e => e.message).join(', ')
      : (process.env.NODE_ENV === 'production' && !isAuthError
        ? 'Internal server error'
        : err.message));

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
    ...(process.env.NODE_ENV !== 'production' && !isAuthError && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
