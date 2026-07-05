require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Table = require('./models/Table');
const connectDB = require('./config/db');

const seed = async () => {
  try {
    await connectDB();

    await User.deleteMany({});
    await Table.deleteMany({});

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Admin created:', admin.email);

    const customer = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'customer',
    });
    console.log('Customer created:', customer.email);

    const tables = [
      { tableNumber: 1, capacity: 2, location: 'indoor' },
      { tableNumber: 2, capacity: 2, location: 'indoor' },
      { tableNumber: 3, capacity: 4, location: 'indoor' },
      { tableNumber: 4, capacity: 4, location: 'indoor' },
      { tableNumber: 5, capacity: 4, location: 'outdoor' },
      { tableNumber: 6, capacity: 6, location: 'outdoor' },
      { tableNumber: 7, capacity: 6, location: 'indoor' },
      { tableNumber: 8, capacity: 8, location: 'indoor' },
    ];

    await Table.insertMany(tables);
    console.log(`Seeded ${tables.length} tables`);

    console.log('\nSeed completed successfully!');
    console.log('Admin login: admin@restaurant.com / admin123');
    console.log('Customer login: john@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
