const app = require('./app');
const config = require('./config');
const eventStore = require('./store/eventStore');

// 1. Event Bootstrap (Initialize at startup)
const INITIAL_EVENT = {
  name: 'Node.js Meet-up',
  totalSeats: 500
};

eventStore.init(INITIAL_EVENT.name, INITIAL_EVENT.totalSeats);
console.log('Event initialized:', eventStore.get());

const server = app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT} in ${config.NODE_ENV} mode`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
