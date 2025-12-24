const eventStore = require('../store/eventStore');
const reservationStore = require('../store/reservationStore');


// Simple unique ID generator
const generateId = () => 'res-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

exports.createReservation = (req, res) => {
  const { partnerId, seats } = req.body;

  // Validation handled by middleware
  
  // 2. Business Logic / Atomic Reservation
  // Since Node is single-threaded, this synchronous check-and-update is atomic.
  const success = eventStore.reserveSeats(seats);

  if (!success) {
      return res.status(409).json({ error: 'Not enough seats left' });
  }

  // 3. Create Reservation Record
  const reservationId = generateId();
  const reservation = {
      reservationId,
      partnerId,
      seats,
      status: 'confirmed',
      createdAt: new Date().toISOString()
  };

  reservationStore.add(reservation);

  // 4. Response
  res.status(201).json({
      reservationId: reservation.reservationId,
      seats: reservation.seats,
      status: reservation.status
  });
};

exports.cancelReservation = (req, res) => {
  const { reservationId } = req.params;

  // 1. Check existence
  const reservation = reservationStore.get(reservationId);

  if (!reservation) {
    return res.status(404).json({ error: 'Reservation not found' });
  }

  if (reservation.status === 'cancelled') {
    return res.status(404).json({ error: 'Reservation already cancelled' });
  }

  // 2. Business Logic: Release Seats
  eventStore.releaseSeats(reservation.seats);

  // 3. Update Status (Soft Delete)
  reservation.status = 'cancelled';
  // reservationStore is updated by reference

  // 4. Response
  res.status(204).send();
};

exports.getReservations = (req, res) => {
  const reservations = reservationStore.getAll();
  res.status(200).json(reservations);
};
