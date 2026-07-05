const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Table = require('./src/models/Table');
const User = require('./src/models/User');

dotenv.config({ path: '../.env' });

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

const timeSlots = [
  '11:00', '12:00', '13:00', '14:00',
  '18:00', '19:00', '20:00', '21:00',
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Table.deleteMany({});
    await Table.insertMany(tables);
    console.log(`Seeded ${tables.length} tables`);

    const adminExists = await User.findOne({ email: 'admin@restaurant.com' });
    if (!adminExists) {
      await User.create({
        name: 'Admin',
        email: 'admin@restaurant.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created (admin@restaurant.com / admin123)');
    } else {
      console.log('Admin user already exists');
    }

    const customerExists = await User.findOne({ email: 'customer@test.com' });
    if (!customerExists) {
      await User.create({
        name: 'Test Customer',
        email: 'customer@test.com',
        password: 'customer123',
        role: 'customer',
      });
      console.log('Test customer created (customer@test.com / customer123)');
    } else {
      console.log('Test customer already exists');
    }

    console.log('Seed complete!');
    console.log(`Available time slots: ${timeSlots.join(', ')}`);
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
