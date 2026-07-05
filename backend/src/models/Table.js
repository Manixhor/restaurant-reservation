const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNumber: {
    type: Number,
    required: [true, 'Table number is required'],
    unique: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1,
  },
  location: {
    type: String,
    enum: ['indoor', 'outdoor', 'bar'],
    default: 'indoor',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Table', tableSchema);
