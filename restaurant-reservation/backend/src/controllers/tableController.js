const Table = require('../models/Table');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getAllTables = catchAsync(async (req, res) => {
  const tables = await Table.find().sort('tableNumber');
  res.json({ tables });
});

exports.createTable = catchAsync(async (req, res) => {
  const { tableNumber, capacity, location } = req.body;
  const table = await Table.create({ tableNumber, capacity, location });
  res.status(201).json({ table });
});

exports.updateTable = catchAsync(async (req, res) => {
  const { capacity, location } = req.body;
  const table = await Table.findByIdAndUpdate(
    req.params.id,
    { capacity, location },
    { new: true, runValidators: true }
  );
  if (!table) throw new AppError('Table not found.', 404);
  res.json({ table });
});

exports.deleteTable = catchAsync(async (req, res) => {
  const table = await Table.findByIdAndDelete(req.params.id);
  if (!table) throw new AppError('Table not found.', 404);
  res.json({ message: 'Table deleted.' });
});
