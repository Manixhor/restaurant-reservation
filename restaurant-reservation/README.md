# Restaurant Reservation Management System

A full-stack restaurant reservation management system with customer and admin roles.

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (running on `localhost:27017`)

### Installation

```bash
# Clone and install
cd restaurant-reservation
cp .env.example .env
cd backend && npm install
cd ../frontend && npm install
cd ..

# Configure environment (defaults are fine for local dev)
# Edit .env if needed

# Seed the database
cd backend && npm run seed

# Start backend (terminal 1)
npm run dev

# Start frontend (terminal 2)
cd ../frontend && npm run dev
```

## Easy Deployment Path

Recommended setup for fastest review-friendly deployment:

1. **MongoDB Atlas**
   - Create a free M0 cluster.
   - Create a database user.
   - Add `0.0.0.0/0` to Network Access for simple assignment deployment.
   - Copy the connection string for `MONGODB_URI`.

2. **Backend on Render**
   - Create a new **Web Service** from the GitHub repo.
   - Root directory: `restaurant-reservation/backend`
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables:
     - `MONGODB_URI=<your MongoDB Atlas connection string>`
     - `JWT_SECRET=<long random production secret>`
     - `JWT_EXPIRES_IN=7d`
     - `NODE_ENV=production`
     - `FRONTEND_URL=<your Vercel frontend URL>`
   - After the service is live, open `/api/health` to confirm the API responds.

3. **Seed Production Data**
   - In Render, open the backend service shell and run:
     ```bash
     npm run seed
     ```
   - This creates the default tables plus demo admin/customer accounts.

4. **Frontend on Vercel**
   - Import the same GitHub repo in Vercel.
   - Root directory: `restaurant-reservation/frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable:
     - `VITE_API_URL=<your Render backend URL>/api`
   - Redeploy after adding the environment variable.

5. **Final Smoke Test**
   - Login as admin and customer using the demo credentials below.
   - Create a customer reservation.
   - Try booking the same date/time until suitable tables run out to verify conflict handling.
   - Login as admin, filter by date, update/cancel a reservation, and manage tables.

### Default Credentials
- **Admin**: `admin@restaurant.com` / `admin123`
- **Customer**: `customer@test.com` / `customer123`

### Tech Stack
- **Frontend**: React + Vite + React Router + Axios
- **Backend**: Node.js + Express 5 + Mongoose
- **Database**: MongoDB
- **Authentication**: JWT (bcryptjs for password hashing)

## Assumptions

- Single restaurant with 8 pre-configured tables (capacities: 2, 2, 4, 4, 4, 6, 6, 8)
- Tables are located in three areas: Window (2-seaters), Main Hall (4-6 seaters), Terrace (6-8 seaters)
- Reservations are in fixed 1-hour time slots: 11:00-14:00 (lunch) and 18:00-21:00 (dinner)
- Customers cannot choose a specific table; the system auto-assigns the best available table
- A reservation is exactly 1 hour (one time slot)
- No payment, notifications, or real-time features are needed

## Reservation & Availability Logic

### Table Assignment Algorithm

1. When a customer requests a reservation, the system:
   - Filters all tables with capacity >= requested number of guests
   - Finds which of those tables are already reserved (status: `confirmed`) for the same date and time slot
   - Assigns the first available table that hasn't been booked for that slot

2. **Conflict Prevention**: A MongoDB compound index on `{ table, date, timeSlot, status }` ensures efficient lookups for conflicting reservations. Only `confirmed` reservations block a table; `cancelled` reservations free the table.

3. **Capacity Enforcement**: Tables are filtered by capacity before checking availability, ensuring a table with 2 seats is never assigned to 4 guests.

4. **Edge Cases**:
   - If no table has sufficient capacity → error response
   - If all suitable tables are booked → error response
   - If a reservation is cancelled, the table becomes available again for that slot

## Role-Based Access

### Customer (User)
- Can register/login with email and password
- Can create reservations (auto-assigned to available table)
- Can view their own reservations only
- Can cancel their own reservations (only if `confirmed`)

### Administrator (Admin)
- Has all customer abilities, plus:
- Can view all reservations across all customers
- Can filter reservations by date
- Can edit any reservation (date, time, guests, status)
- Can cancel any reservation
- Can manage tables (create, edit, delete)

### Authorization Implementation
- JWT tokens are issued on login/register and stored in `localStorage`
- Backend middleware (`protect`) verifies the token on every request
- `adminOnly` middleware checks `req.user.role === 'admin'`
- Frontend uses `ProtectedRoute` component with optional `adminOnly` prop
- API routes are separated: `/reservations/mine` (customer), `/reservations/all` (admin)

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new customer
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (protected)

### Tables
- `GET /api/tables` - List all tables (protected)
- `POST /api/tables` - Create table (admin only)
- `PUT /api/tables/:id` - Update table (admin only)
- `DELETE /api/tables/:id` - Delete table (admin only)

### Reservations
- `POST /api/reservations` - Create reservation (customer)
- `GET /api/reservations/mine` - Get my reservations (customer)
- `PATCH /api/reservations/:id/cancel` - Cancel my reservation (customer)
- `GET /api/reservations/all` - Get all reservations (admin, optional `?date=YYYY-MM-DD`)
- `PUT /api/reservations/:id` - Update reservation (admin)
- `PATCH /api/reservations/:id/admin-cancel` - Cancel any reservation (admin)
- `GET /api/reservations/availability` - Check table availability (protected, query: `date`, `timeSlot`, `numberOfGuests`)

## Project Structure

```
restaurant-reservation/
├── .env                      # Environment variables
├── README.md
├── backend/
│   ├── seed.js               # Database seeder
│   └── src/
│       ├── server.js         # Express app entry point
│       ├── config/db.js      # MongoDB connection
│       ├── controllers/      # Route handlers
│       ├── middleware/        # Auth, validation, error handling
│       ├── models/           # Mongoose schemas
│       ├── routes/           # Express route definitions
│       └── utils/            # AppError, catchAsync
└── frontend/
    └── src/
        ├── App.jsx           # Routes and layout
        ├── context/          # AuthContext
        ├── services/         # Axios API client
        ├── components/       # Navbar, ProtectedRoute
        └── pages/            # Login, Register, Dashboard,
                              # customer/NewReservation, customer/MyReservations,
                              # admin/AdminReservations, admin/ManageTables
```

## Known Limitations

- No email/SMS notifications for reservation confirmations or reminders
- No waiting list when tables are fully booked
- Time slots are fixed (1-hour blocks, no custom durations)
- No support for multiple restaurants or branches
- No unit or integration tests
- Table assignment is automatic; customers cannot pick a specific table
- No pagination for large numbers of reservations

## Areas for Improvement

- Add time slot management (admin-configurable slots, durations)
- Add a waitlist that auto-assigns when a table opens up due to cancellation
- Add email notifications (e.g., Nodemailer with SendGrid)
- Add calendar view for admin (drag-and-drop reservation management)
- Add reservation history/archival for past reservations
- Add unit tests (Jest for backend, Vitest for frontend) and integration tests
- Add rate limiting and request validation hardening
- Add pagination for reservation lists
- Allow customers to choose specific tables from available options
- Add a visual table layout/map for the admin interface
- Containerize with Docker for easier deployment
- Add CI/CD pipeline with GitHub Actions
