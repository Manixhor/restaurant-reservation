const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const findAvailableTable = async ({ date, timeSlot, numberOfGuests, excludeReservationId }) => {
  const suitableTables = await Table.find({ capacity: { $gte: numberOfGuests } }).sort('capacity tableNumber');

  if (suitableTables.length === 0) {
    throw new AppError('No tables available with sufficient capacity.', 400);
  }

  const conflictFilter = {
    date,
    timeSlot,
    status: 'confirmed',
    table: { $in: suitableTables.map(t => t._id) },
  };

  if (excludeReservationId) {
    conflictFilter._id = { $ne: excludeReservationId };
  }

  const conflictingReservations = await Reservation.find(conflictFilter);
  const reservedTableIds = new Set(conflictingReservations.map(r => r.table.toString()));

  return suitableTables.find(t => !reservedTableIds.has(t._id.toString()));
};

// Customers: create their own reservation
exports.createReservation = catchAsync(async (req, res) => {
  const { date, timeSlot, numberOfGuests } = req.body;

  if (!date || !timeSlot || !numberOfGuests) {
    throw new AppError('Date, time slot, and number of guests are required.', 400);
  }

  if (numberOfGuests > 20) {
    throw new AppError('Maximum 20 guests per reservation.', 400);
  }

  const availableTable = await findAvailableTable({ date, timeSlot, numberOfGuests });

  if (!availableTable) {
    throw new AppError('No tables available for this date and time slot.', 400);
  }

  const reservation = await Reservation.create({
    user: req.user._id,
    table: availableTable._id,
    date,
    timeSlot,
    numberOfGuests,
  });

  const populated = await Reservation.findById(reservation._id)
    .populate('table', 'tableNumber capacity location')
    .populate('user', 'name email');

  res.status(201).json({ reservation: populated });
});

// Customers: get their own reservations
exports.getMyReservations = catchAsync(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('table', 'tableNumber capacity location')
    .sort('-createdAt');
  res.json({ reservations });
});

// Customers: cancel their own reservation
exports.cancelMyReservation = catchAsync(async (req, res) => {
  const reservation = await Reservation.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!reservation) throw new AppError('Reservation not found.', 404);
  if (reservation.status === 'cancelled') throw new AppError('Reservation already cancelled.', 400);

  reservation.status = 'cancelled';
  await reservation.save();

  res.json({ reservation });
});

// Admin: get all reservations
exports.getAllReservations = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.date) filter.date = req.query.date;

  let query = Reservation.find(filter)
    .populate('table', 'tableNumber capacity location')
    .populate('user', 'name email')
    .sort('-createdAt');

  // Search by user name or email
  if (req.query.search) {
    const users = await require('../models/User').find({
      $or: [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } },
      ],
    }).select('_id');
    filter.user = { $in: users.map(u => u._id) };
    query = Reservation.find(filter)
      .populate('table', 'tableNumber capacity location')
      .populate('user', 'name email')
      .sort('-createdAt');
  }

  const reservations = await query;

  res.json({ reservations });
});

// Admin: update any reservation
exports.updateReservation = catchAsync(async (req, res) => {
  const { date, timeSlot, numberOfGuests, status } = req.body;

  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError('Reservation not found.', 404);

  const nextDate = date || reservation.date;
  const nextTimeSlot = timeSlot || reservation.timeSlot;
  const nextGuests = numberOfGuests || reservation.numberOfGuests;
  const nextStatus = status || reservation.status;

  if (nextGuests > 20) {
    throw new AppError('Maximum 20 guests per reservation.', 400);
  }

  if (nextStatus === 'confirmed') {
    const availableTable = await findAvailableTable({
      date: nextDate,
      timeSlot: nextTimeSlot,
      numberOfGuests: nextGuests,
      excludeReservationId: reservation._id,
    });

    if (!availableTable) {
      throw new AppError('No tables available for this date and time slot.', 400);
    }

    reservation.table = availableTable._id;
  }

  reservation.date = nextDate;
  reservation.timeSlot = nextTimeSlot;
  reservation.numberOfGuests = nextGuests;
  if (status) reservation.status = status;

  await reservation.save();

  const populated = await Reservation.findById(reservation._id)
    .populate('table', 'tableNumber capacity location')
    .populate('user', 'name email');

  res.json({ reservation: populated });
});

// Admin: cancel any reservation
exports.cancelReservation = catchAsync(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);
  if (!reservation) throw new AppError('Reservation not found.', 404);

  reservation.status = 'cancelled';
  await reservation.save();

  res.json({ reservation });
});

// Check availability for a given date and time slot
exports.checkAvailability = catchAsync(async (req, res) => {
  const { date, timeSlot, numberOfGuests } = req.query;

  if (!date || !timeSlot) {
    throw new AppError('Date and time slot are required.', 400);
  }

  const capacityFilter = numberOfGuests ? { capacity: { $gte: Number(numberOfGuests) } } : {};
  const allTables = await Table.find(capacityFilter).sort('tableNumber');

  const conflictingReservations = await Reservation.find({
    date,
    timeSlot,
    status: 'confirmed',
    table: { $in: allTables.map(t => t._id) },
  });

  const reservedTableIds = conflictingReservations.map(r => r.table.toString());

  const availableTables = allTables.map(t => ({
    ...t.toObject(),
    available: !reservedTableIds.includes(t._id.toString()),
  }));

  res.json({ tables: availableTables });
});
