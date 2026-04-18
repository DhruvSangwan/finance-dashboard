# 💰 Personal Finance Dashboard

A full-stack application to **track expenses, manage monthly budgets, and understand spending behavior through meaningful insights**.

---

## 🎯 What this project is about

Most expense trackers only show data.

This project focuses on:

* **tracking spending**
* **understanding patterns**
* **making better financial decisions**

Instead of just listing transactions, it analyzes your data to answer:

* Where am I spending the most?
* Am I going over budget?
* What will I spend by the end of the month?

---

## 🚀 Features

### 📊 Dashboard

* Monthly spending overview
* Budget usage with visual progress
* Week-over-week and month-over-month comparisons
* Recent transactions

---

### 📈 Budget Planning

* Set monthly budget
* Remaining budget calculation
* Daily budget left
* Projected end-of-month spending
* Weekly spending breakdown

---

### 🔍 Analytics

* Spending by day of week (behavior patterns)
* Top expenses in a month
* Category-wise breakdown with percentages
* Trend charts over time

---

### 💡 Insights (core idea)

The app computes:

* Total monthly spend
* Average daily spending
* Highest spending category
* Budget overrun / underutilization
* Spending trends across time

The goal is to move from:

> “data display” → “decision support”

---

### 🤖 AI Features (experimental)

* Natural language search for expenses
* AI-generated summaries of spending

(*Note: core insights are computed locally using deterministic logic*)

---

## 🧠 How it works (high level)

```text
User Input → Stored in PostgreSQL
            ↓
Backend (Node.js + Express)
            ↓
Data Processing (aggregations, projections, comparisons)
            ↓
Frontend (React)
            ↓
Charts + Insights + UI
```

---

## 🛠️ Tech Stack

**Frontend**

* React (Vite)
* Recharts

**Backend**

* Node.js
* Express

**Database**

* PostgreSQL

**Authentication**

* JWT (JSON Web Tokens)

**Other**

* CSV export
* Basic AI integration (Claude API)

---

## 📁 Project Structure

```
finance-dashboard/
├── backend/
│   ├── config/         → Database setup
│   ├── controllers/    → Core logic
│   ├── middleware/     → Auth & error handling
│   ├── models/         → DB queries
│   ├── routes/         → API endpoints
│   └── server.js
├── frontend/
│   ├── components/     → UI components
│   ├── pages/          → App screens
│   ├── context/        → Global state
│   ├── utils/          → API + helpers
│   └── App.jsx
```

---

## ⚙️ Setup

### Prerequisites

* Node.js (v18+)
* PostgreSQL

---

### Database

```sql
CREATE DATABASE finance_dashboard;
```

Run schema from:

```
backend/config/schema.sql
```

---

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

---

### Frontend

```bash
cd frontend
npm install
npm start
```

---

### Environment Variables

```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/finance_dashboard
JWT_SECRET=your_secret
ANTHROPIC_API_KEY=your_key
FRONTEND_URL=http://localhost:3000
```

---

## 📌 Notes

* The system focuses on **practical financial insights**, not just UI
* All calculations (budget, projections, trends) are computed from user data
* Designed to simulate real-world personal finance tools

---

## 👤 Author

Dhruv Sangwan

---

## ⭐ Why this project stands out

* Full-stack implementation (frontend + backend + database)
* Real-world use case (personal finance management)
* Emphasis on **insight generation, not just visualization**
* Demonstrates system design, data processing, and user-focused thinking
