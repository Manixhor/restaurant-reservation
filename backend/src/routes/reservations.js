const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { create, getMyReservations, cancel, getById } = require('../controllers/reservationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/', [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
  body('guests').isInt({ min: 1 }).withMessage('Number of guests must be at least 1'),
], create);

router.get('/', getMyReservations);
router.get('/:id', getById);
router.patch('/:id/cancel', cancel);

module.exports = router;
