/**
 * Validation Middleware
 */
exports.validateReservation = (req, res, next) => {
  const { partnerId, seats } = req.body;

  if (!partnerId) {
    return next({ status: 400, message: 'Missing partnerId' });
  }

  if (typeof partnerId !== 'string') {
      return next({ status: 400, message: 'partnerId must be a string' });
  }

  if (seats === undefined) {
      return next({ status: 400, message: 'Missing seats' });
  }
  
  if (!Number.isInteger(seats)) {
    return next({ status: 400, message: 'Seats must be an integer' });
  }
  
  if (seats <= 0 || seats > 10) {
    return next({ status: 400, message: 'Seats must be between 1 and 10' });
  }

  next();
};
