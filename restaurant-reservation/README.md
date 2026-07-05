# Restaurant Reservation Management System

A full-stack restaurant reservation application built with React, Node.js, Express, MongoDB, and JWT authentication. The system supports customer reservations and administrator management for a single restaurant.

## Live Links

- Frontend: https://restaurant-reservation-dm6slknqa-manis-projects-b2333fb6.vercel.app
- Backend health check: https://restaurant-reservation-backend-9a3s.onrender.com/api/health
- GitHub repository: https://github.com/Manixhor/restaurant-reservation

## Tech Stack

- Frontend: React, Vite, React Router, Axios
- Backend: Node.js, Express, Mongoose
- Database: MongoDB Atlas
- Authentication: JWT, bcryptjs
- Deployment: Vercel for frontend, Render for backend

## Demo Credentials

Admin:

```text
admin@restaurant.com
admin123
```

Customer:

```text
customer@test.com
customer123
```

## Local Setup

### Prerequisites

- Node.js 18 or later
- MongoDB Atlas connection string or local MongoDB
- npm

### Environment Variables

Create a `.env` file in the project root using `.env.example` as a reference.

```env
MONGODB_URI=mongodb+srv://username:password@cluster-url/restaurant-reservation
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
PORT=5001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

For the frontend, create `frontend/.env.local` if you want to explicitly point to the local backend:

```env
VITE_API_URL=http://localhost:5001/api
```

### Install Dependencies

```bash
cd restaurant-reservation/backend
npm install

cd ../frontend
npm install
```

### Seed Database

```bash
cd restaurant-reservation/backend
npm run seed
```

This creates default tables and demo admin/customer accounts.

### Run Backend

```bash
cd restaurant-reservation/backend
npm run dev
```

Backend runs on:

```text
http://localhost:5001
```

Health check:

```text
http://localhost:5001/api/health
```

### Run Frontend

```bash
cd restaurant-reservation/frontend
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Features

### Customer

- Register and login
- Create a reservation
- View own reservations
- Cancel own confirmed reservations
- See assigned table information

### Admin

- Login as administrator
- View all reservations
- Filter reservations by date
- Search reservations by customer name or email
- Update or cancel any reservation
- Create, update, and delete restaurant tables
- View table capacity and location information

## Assumptions

- The system is for one restaurant only.
- Tables are preconfigured through the seed script.
- Each table has a table number, capacity, and location.
- Reservations use fixed one-hour time slots.
- Customers cannot manually choose a table. The backend assigns the best available table.
- Only confirmed reservations block availability. Cancelled reservations free the table.
- Payments, notifications, and real-time updates are out of scope.

Default seeded tables:

```text
Table 1: 2 seats, Window
Table 2: 2 seats, Window
Table 3: 4 seats, Main Hall
Table 4: 4 seats, Main Hall
Table 5: 4 seats, Main Hall
Table 6: 6 seats, Main Hall
Table 7: 6 seats, Terrace
Table 8: 8 seats, Terrace
```

Default time slots:

```text
11:00, 12:00, 13:00, 14:00, 18:00, 19:00, 20:00, 21:00
```

## Reservation And Availability Logic

When a customer creates a reservation, the backend:

1. Validates date, time slot, and number of guests.
2. Finds all tables with capacity greater than or equal to the requested guest count.
3. Finds confirmed reservations for the same date and time slot.
4. Removes already-booked tables from the suitable table list.
5. Assigns the smallest available table that fits the party.
6. Returns a clear error if no suitable table is available.

This prevents:

- Double booking the same table for the same date and time slot
- Assigning a table that is too small for the number of guests
- Booking invalid or unavailable slots without a useful error message

The Reservation model also uses a MongoDB unique partial index on confirmed reservations for table/date/time slot. This adds a database-level safety check against duplicate confirmed bookings.

Admin reservation updates also re-run availability checks so an admin cannot move a reservation into a conflicting table/time slot.

## Role-Based Access Control

The backend uses JWT authentication. After login, the client sends the token in the Authorization header.

Protected routes use authentication middleware to verify the token and attach the logged-in user to the request.

Admin-only routes use role authorization and require:

```text
role === admin
```

Customer users can only access their own reservations. Admin users can access all reservations and table management routes.

## API Overview

### Auth

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Reservations

```text
POST  /api/reservations
GET   /api/reservations/mine
PATCH /api/reservations/:id/cancel
GET   /api/reservations/all
PUT   /api/reservations/:id
PATCH /api/reservations/:id/admin-cancel
GET   /api/reservations/availability
```

### Tables

```text
GET    /api/tables
POST   /api/tables
PUT    /api/tables/:id
DELETE /api/tables/:id
```

## Project Structure

```text
restaurant-reservation/
├── backend/
│   ├── seed.js
│   ├── package.json
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── utils/
│       └── server.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       └── main.jsx
├── .env.example
└── README.md
```

## Deployment Notes

Backend is deployed on Render. Required Render environment variables:

```text
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=<Vercel frontend URL>
```

Frontend is deployed on Vercel. Required Vercel environment variable:

```text
VITE_API_URL=<Render backend URL>/api
```

For this deployment:

```text
VITE_API_URL=https://restaurant-reservation-backend-9a3s.onrender.com/api
```

## Known Limitations

- No payment flow
- No email or SMS confirmations
- No real-time table updates
- No waitlist for fully booked time slots
- No pagination for large reservation lists
- No automated test suite
- Single restaurant only
- Fixed time slots only

## Improvements With More Time

- Add automated backend tests for conflict handling and authorization
- Add frontend tests for customer and admin workflows
- Add admin-configurable time slots
- Add email confirmations and reminders
- Add pagination and sorting for admin reservations
- Add waitlist support
- Add audit logs for admin reservation changes
- Add a calendar view for reservations
- Add rate limiting and stronger validation rules
- Add Docker setup for easier local and production deployment
