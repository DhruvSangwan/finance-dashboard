# 🚀 Deployment Guide — Render (Free Tier)

This guide walks you through deploying your Finance Dashboard to Render.
Your app will be live at a public URL for free.

---

## What We're Deploying
- **Backend**: Node.js/Express API → Render Web Service
- **Database**: PostgreSQL → Render PostgreSQL (free tier)
- **Frontend**: React app → Render Static Site

---

## Step 1: Push Code to GitHub

First, get your code onto GitHub (Render deploys from GitHub).

```bash
# In your finance-dashboard/ root folder:
git init
git add .
git commit -m "Initial commit: Finance Dashboard"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/finance-dashboard.git
git push -u origin main
```

**Important**: Create a `.gitignore` file so you don't push secrets:
```
# .gitignore (in root of project)
node_modules/
backend/.env
frontend/.env
.DS_Store
```

---

## Step 2: Create a PostgreSQL Database on Render

1. Go to **https://render.com** → Sign up for free
2. Click **"New +"** → **"PostgreSQL"**
3. Settings:
   - Name: `finance-dashboard-db`
   - Region: pick closest to you
   - Plan: **Free**
4. Click **"Create Database"**
5. On the database page, copy the **"External Database URL"** — you'll need it

---

## Step 3: Set Up the Database Tables

Using the External URL you just copied, run your schema:

**Option A: Using psql in terminal**
```bash
psql YOUR_EXTERNAL_DATABASE_URL -f backend/config/schema.sql
psql YOUR_EXTERNAL_DATABASE_URL -f backend/config/schema_additions.sql
```

**Option B: Using pgAdmin**
1. Connect using the credentials from Render dashboard
2. Open Query Tool and paste the contents of schema.sql, then run

---

## Step 4: Deploy the Backend (Web Service)

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `finance-dashboard-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Click **"Advanced"** → **"Add Environment Variables"**:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | (paste your Internal Database URL from Step 2) |
| `JWT_SECRET` | (generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) |
| `ANTHROPIC_API_KEY` | (from console.anthropic.com) |
| `FRONTEND_URL` | (your frontend URL — fill in after Step 5) |

5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment. Note your backend URL:
   `https://finance-dashboard-api.onrender.com`

---

## Step 5: Deploy the Frontend (Static Site)

1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repo
3. Settings:
   - **Name**: `finance-dashboard-app`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

4. Add Environment Variable:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://finance-dashboard-api.onrender.com/api` |

5. Click **"Create Static Site"**
6. Note your frontend URL: `https://finance-dashboard-app.onrender.com`

---

## Step 6: Update Backend CORS

Go back to your backend Web Service on Render:
1. Environment → Edit `FRONTEND_URL`
2. Set it to: `https://finance-dashboard-app.onrender.com`
3. Save → Render will redeploy automatically

---

## Step 7: Test Your Live App!

Visit your frontend URL and:
- ✅ Sign up for an account
- ✅ Add some expenses
- ✅ View charts
- ✅ Set a budget
- ✅ Click "Get AI Insight"
- ✅ Export to CSV

---

## Common Issues

**"Application Error" on backend:**
- Check logs in Render dashboard → "Logs" tab
- Most common: wrong DATABASE_URL or missing environment variable

**Frontend shows blank page:**
- Check browser console (F12) for errors
- Make sure REACT_APP_API_URL is set correctly

**"CORS error" in browser:**
- Make sure FRONTEND_URL in backend env matches your exact frontend URL

**Free tier note:**
- Render's free web services "spin down" after 15 min of inactivity
- First request after inactivity takes ~30 seconds to wake up
- The database stays active

---

## Updating Your App

To push changes after deployment:
```bash
git add .
git commit -m "your change description"
git push origin main
# Render auto-deploys when you push to main!
```
