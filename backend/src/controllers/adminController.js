const Reservation = require('../models/Reservation');

exports.getAllReservations = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const filter = {};

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    if (status) {
      filter.status = status;
    }

    const reservations = await Reservation.find(filter)
      .populate('table', 'tableNumber capacity location')
      .populate('user', 'name email')
      .sort({ date: -1, timeSlot: -1 });

    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

exports.updateReservation = async (req, res, next) => {
  try {
    const { date, timeSlot, guests, status, table } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (date) reservation.date = new Date(date);
    if (timeSlot) reservation.timeSlot = timeSlot;
    if (guests) reservation.guests = guests;
    if (status) reservation.status = status;
    if (table) reservation.table = table;

    await reservation.save();

    const updated = await Reservation.findById(reservation._id)
      .populate('table', 'tableNumber capacity location')
      .populate('user', 'name email');

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

exports.cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    reservation.status = 'cancelled';
    await reservation.save();

    res.json(reservation);
  } catch (error) {
    next(error);
  }
};
