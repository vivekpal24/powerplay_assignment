# TicketBoss: Event Ticketing API

A robust, high-performance Node.js REST API designed to manage event seat reservations under high concurrency. This project demonstrates clean architecture, atomic state management, and reliable error handling without external database dependencies.

## 📋 Project Overview

TicketBoss is a specialized microservice for managing inventory for a single high-demand event. It handles the lifecycle of seat reservations—from initialization (bootstrap) to booking and cancellation—ensuring data integrity and preventing overselling through synchronous critical section logic.

### Key Logic
- **Bootstrap**: Initializes a single event singleton.
- **Reservation**: Atomically decrements inventory if available.
- **Cancellation**: Releases seats back to the pool (Soft Delete).
- **Concurrency**: Leverages the Node.js event loop to handle parallel requests safely without complex locking mechanisms.

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ticket-boss-api
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start the Server**
   - **Production Mode**:
     ```bash
     npm start
     ```
   - **Development Mode** (with hot-reload):
     ```bash
     npm run dev
     ```
   The server will start on `http://localhost:3000`.

### Running Tests
The project includes a comprehensive integration test suite using **Jest** and **Supertest**.
```bash
npm test
```

---

## 📖 API Documentation

### 1. Get Event Summary
Retrieves the current state of the event, including availability and versioning.

- **Endpoint**: `GET /event`
- **Response**: `200 OK`
  ```json
  {
    "eventId": "event-1703456789000",
    "name": "Node.js Meet-up",
    "totalSeats": 500,
    "availableSeats": 498,
    "reservationCount": 2,
    "version": 3
  }
  ```

### 2. Reserve Seats
Book seats for a partner. Validates availability and input constraints (1-10 seats).

- **Endpoint**: `POST /reservations`
- **Body**:
  ```json
  {
    "partnerId": "ACME-Corp",
    "seats": 3
  }
  ```
- **Responses**:
  - `201 Created`:
    ```json
    {
      "reservationId": "res-1703456799000-123",
      "seats": 3,
      "status": "confirmed"
    }
    ```
  - `400 Bad Request`: Invalid partnerId or seat count (must be integer 1-10).
  - `409 Conflict`: Not enough seats available.

### 3. Cancel Reservation
Cancels an existing reservation and releases seats back to the pool.

- **Endpoint**: `DELETE /reservations/:reservationId`
- **Responses**:
  - `204 No Content`: Cancellation successful.
  - `404 Not Found`: Reservation ID does not exist or was already cancelled.

### 4. List Reservations
Returns a list of all reservations for auditing.

- **Endpoint**: `GET /reservations`
- **Response**: `200 OK`
  ```json
  [
    {
      "reservationId": "res-170...",
      "partnerId": "ACME-Corp",
      "seats": 3,
      "status": "confirmed",
      "createdAt": "2025-12-23T10:00:00Z"
    }
  ]
  ```

---

## 🏗️ Technical Decisions & Architecture

### Architecture: Clean & Layered
The application follows a **Separation of Concerns** principle:
- **Routes (`/routes`)**: Define API endpoints.
- **Middleware (`/middleware`)**: Centralized validation and error handling.
- **Controllers (`/controllers`)**: Handle HTTP request parsing and response formatting.
- **Store (`/store`)**: In-memory data persistence and business logic. Acts as a "Service/Repository" hybrid for this scope.

### Storage: In-Memory Strategy
- **Decision**: Used native JavaScript `Map` and `Object` for storage.
- **Reasoning**: Requirements specified "in-memory only". `Map` provides O(1) lookups for reservations. A Singleton class manages the Event state to ensure a single source of truth.

### Concurrency Control
- **Challenge**: Preventing "overselling" when multiple requests arrive simultaneously for the last few seats.
- **Solution**: Node.js is single-threaded. By keeping the "check availability" and "decrement seats" actions synchronous within the `EventStore.reserveSeats` method, we effectively create an atomic transaction. No external mutex/lock is needed because no I/O operations occur *between* the check and the update.

### Versioning
- **Implementation**: An integer `version` field on the Event object increments on every successful reservation or cancellation.
- **Purpose**: Allows clients to detect state changes (Optimistic Concurrency Control pattern).

---

## ⚠️ Assumptions & Limitations

1. **Persistence**: As requested, data is **ephemeral**. Restarting the server resets all reservations.
2. **Scalability**: This in-memory architecture works perfectly for a single instance. If scaled to multiple server instances (horizontal scaling), a shared external store (like Redis) would be required to maintain consistent state.
3. **Authentication**: No auth headers were required by the prompt, so the API is open. In production, JWT or API Key middleware would be added.

---
*Generated for TicketBoss Coding Challenge*
