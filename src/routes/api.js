const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const reservationController = require('../controllers/reservationController');
const { validateReservation } = require('../middleware/validator');

router.get('/event', eventController.getEventSummary);
router.post('/reservations', validateReservation, reservationController.createReservation);
router.delete('/reservations/:reservationId', reservationController.cancelReservation);
router.get('/reservations', reservationController.getReservations);

module.exports = router;
