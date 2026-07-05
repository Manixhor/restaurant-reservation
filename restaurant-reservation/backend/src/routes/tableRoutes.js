const { Router } = require('express');
const tableController = require('../controllers/tableController');
const { protect, adminOnly } = require('../middleware/auth');

const router = Router();

router.get('/', protect, tableController.getAllTables);
router.post('/', protect, adminOnly, tableController.createTable);
router.put('/:id', protect, adminOnly, tableController.updateTable);
router.delete('/:id', protect, adminOnly, tableController.deleteTable);

module.exports = router;
