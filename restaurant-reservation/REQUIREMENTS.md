# Requirements

This project does not use a Python `requirements.txt` file because it is a Node.js full-stack application. Dependencies are installed from the two `package.json` files.

## System Requirements

- Node.js 18 or later
- npm
- MongoDB Atlas connection string or local MongoDB
- Git

## Install Project Dependencies

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Environment Variables

Copy `.env.example` to `.env` in the project root and fill in the values:

```bash
cp .env.example .env
```

For local frontend testing, create `frontend/.env.local` only on your machine if needed:

```env
VITE_API_URL=http://localhost:5001/api
```

Do not commit real `.env` or `.env.local` files.

## Production Requirements

Render backend environment variables:

```text
MONGODB_URI=<MongoDB Atlas connection string>
JWT_SECRET=<long random secret>
JWT_EXPIRES_IN=7d
NODE_ENV=production
FRONTEND_URL=<Vercel frontend URL>
```

Vercel frontend environment variable:

```text
VITE_API_URL=<Render backend URL>/api
```
