const express = require('express');
const router = express.Router();
const { getAllReservations, updateReservation, cancelReservation } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/reservations', getAllReservations);
router.put('/reservations/:id', updateReservation);
router.patch('/reservations/:id/cancel', cancelReservation);

module.exports = router;
