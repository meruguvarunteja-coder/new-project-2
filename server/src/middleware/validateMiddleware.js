export const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err) {
    if (err.errors) {
      const details = err.errors.map(e => ({ field: e.path.join('.'), message: e.message }));
      return res.status(400).json({
        success: false,
        message: 'Validation failed for request payload',
        errors: details
      });
    }
    return res.status(400).json({ success: false, message: err.message || 'Invalid payload' });
  }
};
