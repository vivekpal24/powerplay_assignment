const eventStore = require('../store/eventStore');

/**
 * Get Event Summary
 */
exports.getEventSummary = (req, res) => {
  const event = eventStore.get();
  
  if (!event) {
    return res.status(404).json({ error: 'Event not initialized' });
  }

  res.status(200).json({
    eventId: event.eventId,
    name: event.name,
    totalSeats: event.totalSeats,
    availableSeats: event.availableSeats,
    reservationCount: event.reservedSeats, 
    version: event.version
  });
};
