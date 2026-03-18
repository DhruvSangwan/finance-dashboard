# 💰 Personal Finance Dashboard

A full-stack web app with AI-powered spending insights.

## Tech Stack
- **Frontend**: React + Recharts
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Auth**: JWT (JSON Web Tokens)
- **AI**: Claude API

## Folder Structure
```
finance-dashboard/
├── backend/
│   ├── config/         → Database connection setup
│   ├── controllers/    → Business logic (what happens when routes are hit)
│   ├── middleware/     → Auth checks, error handling
│   ├── models/         → SQL queries for the database
│   ├── routes/         → URL endpoint definitions
│   ├── server.js       → App entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/ → Reusable UI pieces (charts, forms, etc.)
│   │   ├── pages/      → Full pages (Login, Dashboard, etc.)
│   │   ├── context/    → Global state (who's logged in)
│   │   ├── utils/      → Helper functions (API calls, CSV export)
│   │   └── App.jsx     → Root component + routing
│   └── package.json
└── README.md
```

## Setup Instructions

### 1. Prerequisites
- Node.js (v18+): https://nodejs.org
- PostgreSQL: https://postgresql.org/download

### 2. Database Setup
```sql
-- In psql or pgAdmin, create the database:
CREATE DATABASE finance_dashboard;
```
Then run the SQL in `backend/config/schema.sql` to create tables.

### 3. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials and secrets
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 5. Environment Variables (backend/.env)
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/finance_dashboard
JWT_SECRET=your_random_secret_string_here
ANTHROPIC_API_KEY=your_claude_api_key_here
FRONTEND_URL=http://localhost:3000
```

## Deployment (Render)
See `DEPLOYMENT.md` for step-by-step Render deployment guide.
