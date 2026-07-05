const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  table: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  date: {
    type: Date,
    required: [true, 'Reservation date is required'],
  },
  timeSlot: {
    type: String,
    required: [true, 'Time slot is required'],
    enum: [
      '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
      '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
      '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
    ],
  },
  guests: {
    type: Number,
    required: [true, 'Number of guests is required'],
    min: 1,
    max: 20,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed',
  },
}, {
  timestamps: true,
});

reservationSchema.index({ table: 1, date: 1, timeSlot: 1, status: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);
