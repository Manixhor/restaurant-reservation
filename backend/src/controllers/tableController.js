const { validationResult } = require('express-validator');
const Table = require('../models/Table');
const Reservation = require('../models/Reservation');

exports.getAll = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }

    const table = await Table.create(req.body);
    res.status(201).json(table);
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json(table);
  } catch (error) {
    next(error);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const hasReservations = await Reservation.exists({ table: req.params.id, status: 'confirmed' });
    if (hasReservations) {
      return res.status(400).json({ error: 'Cannot delete table with active reservations' });
    }

    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json({ message: 'Table removed successfully' });
  } catch (error) {
    next(error);
  }
};
