/**
 * Centralized Error Handler
 */
module.exports = (err, req, res, next) => {
  // Handle syntax errors (invalid JSON)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }

  // Handle custom errors
  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  // Handle defaults
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};
