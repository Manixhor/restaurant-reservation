const { validationResult } = require('express-validator');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }

    const { date, timeSlot, guests } = req.body;

    if (guests < 1) {
      return res.status(400).json({ error: 'Number of guests must be at least 1' });
    }

    if (guests > 20) {
      return res.status(400).json({ error: 'Maximum 20 guests per reservation' });
    }

    const reservationDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (reservationDate < today) {
      return res.status(400).json({ error: 'Reservation date cannot be in the past' });
    }

    const availableTable = await findAvailableTable(reservationDate, timeSlot, guests);

    if (!availableTable) {
      return res.status(409).json({
        error: 'No tables available for the selected date, time, and party size',
      });
    }

    const reservation = await Reservation.create({
      user: req.user._id,
      table: availableTable._id,
      date: reservationDate,
      timeSlot,
      guests,
    });

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity location')
      .populate('user', 'name email');

    res.status(201).json(populatedReservation);
  } catch (error) {
    next(error);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id })
      .populate('table', 'tableNumber capacity location')
      .sort({ date: -1, timeSlot: -1 });

    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

exports.cancel = async (req, res, next) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({ error: 'Reservation is already cancelled' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('table', 'tableNumber capacity location')
      .populate('user', 'name email');

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (reservation.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this reservation' });
    }

    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

const findAvailableTable = async (date, timeSlot, guests) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const tables = await Table.find({ capacity: { $gte: guests } }).sort({ capacity: 1 });

  for (const table of tables) {
    const existingReservation = await Reservation.findOne({
      table: table._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      timeSlot,
      status: 'confirmed',
    });

    if (!existingReservation) {
      return table;
    }
  }

  return null;
};

exports.findAvailableTable = findAvailableTable;
