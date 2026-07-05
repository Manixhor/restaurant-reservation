const { Router } = require('express');
const reservationController = require('../controllers/reservationController');
const { protect, adminOnly } = require('../middleware/auth');

const router = Router();

router.get('/availability', protect, reservationController.checkAvailability);

router.post('/', protect, reservationController.createReservation);
router.get('/mine', protect, reservationController.getMyReservations);
router.patch('/:id/cancel', protect, reservationController.cancelMyReservation);

router.get('/all', protect, adminOnly, reservationController.getAllReservations);
router.put('/:id', protect, adminOnly, reservationController.updateReservation);
router.patch('/:id/admin-cancel', protect, adminOnly, reservationController.cancelReservation);

module.exports = router;
