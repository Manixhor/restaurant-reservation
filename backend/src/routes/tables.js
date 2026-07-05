const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAll);

router.post('/', protect, adminOnly, [
  body('tableNumber').isInt({ min: 1 }).withMessage('Table number must be a positive integer'),
  body('capacity').isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
], create);

router.put('/:id', protect, adminOnly, update);
router.delete('/:id', protect, adminOnly, remove);

module.exports = router;
