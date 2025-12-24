/**
 * In-memory Event Store
 * Singleton pattern to manage the state of the event.
 */
class EventStore {
  constructor() {
    this.event = null;
  }

  /**
   * Initialize the event.
   * @param {string} name - Name of the event.
   * @param {number} totalSeats - Total number of seats.
   */
  init(name, totalSeats) {
    this.event = {
      eventId: 'event-' + Date.now(), // Simple unique ID
      name,
      totalSeats,
      availableSeats: totalSeats,
      reservedSeats: 0, // Explicitly tracking reserved count
      version: 1, // Start at version 1
    };
    return this.event;
  }

  /**
   * Get the current event state.
   * @returns {object|null} The event object.
   */
  get() {
    return this.event ? { ...this.event } : null; // Return copy to prevent direct mutation
  }

  
  /**
   * Check if initialized
   */
  isInitialized() {
      return this.event !== null;
  }
  /**
   * Attempt to reserve seats.
   * Atomically checks availability and updates state if possible.
   * @param {number} count - Number of seats to reserve.
   * @returns {boolean} True if successful, false if insufficient seats.
   */
  reserveSeats(count) {
    if (!this.event) return false;

    // Critical Section Logic
    if (this.event.availableSeats >= count) {
      this.event.availableSeats -= count;
      this.event.reservedSeats += count;
      this.event.version += 1; // Increment version on seat change
      return true;
    }
    
    return false;
  }

  /**
   * Release seats back to the pool.
   * @param {number} count - Number of seats to release.
   */
  releaseSeats(count) {
    if (!this.event) return;
    
    this.event.availableSeats += count;
    this.event.reservedSeats -= count; // Should check if < 0? Assuming data integrity holds.
    this.event.version += 1;
  }
}

// Export a singleton instance
module.exports = new EventStore();
