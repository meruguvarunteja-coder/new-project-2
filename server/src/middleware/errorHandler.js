export const errorHandler = (err, req, res, next) => {
  console.error('SERVER_ERROR:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
