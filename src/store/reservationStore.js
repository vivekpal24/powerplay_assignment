/**
 * In-memory Reservation Store
 * Manages individual reservation records.
 */
class ReservationStore {
  constructor() {
    this.reservations = new Map();
  }

  add(reservation) {
    this.reservations.set(reservation.reservationId, reservation);
    return reservation;
  }

  get(reservationId) {
    return this.reservations.get(reservationId);
  }

  remove(reservationId) {
    return this.reservations.delete(reservationId);
  }

  getAll() {
    return Array.from(this.reservations.values());
  }
  
  // Helper for testing
  clear() {
      this.reservations.clear();
  }
}

module.exports = new ReservationStore();
