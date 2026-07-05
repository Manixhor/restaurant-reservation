const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config({ path: '../.env' });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.get('/api/seed-once', async (req, res, next) => {
  try {
    const Table = require('./models/Table');
    const User = require('./models/User');

    const tables = [
      { tableNumber: 1, capacity: 2, location: 'Window' },
      { tableNumber: 2, capacity: 2, location: 'Window' },
      { tableNumber: 3, capacity: 4, location: 'Main Hall' },
      { tableNumber: 4, capacity: 4, location: 'Main Hall' },
      { tableNumber: 5, capacity: 4, location: 'Main Hall' },
      { tableNumber: 6, capacity: 6, location: 'Main Hall' },
      { tableNumber: 7, capacity: 6, location: 'Terrace' },
      { tableNumber: 8, capacity: 8, location: 'Terrace' },
    ];

    if ((await Table.countDocuments()) === 0) {
      await Table.insertMany(tables);
    }

    const admin = await User.findOne({ email: 'admin@restaurant.com' });
    if (!admin) {
      await User.create({
        name: 'Admin',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin',
      });
    }

    const customer = await User.findOne({ email: 'customer@test.com' });
    if (!customer) {
      await User.create({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'customer123',
        role: 'customer',
      });
    }

    res.json({ message: 'Seed completed' });
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);

app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
