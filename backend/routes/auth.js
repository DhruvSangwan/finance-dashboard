// =============================================================
// AUTH ROUTES (routes/auth.js)
// Defines URL endpoints for authentication
// Routes connect URLs to controller functions
// =============================================================

const express = require('express');
const router = express.Router(); // A mini Express app for grouping routes
const { signup, login } = require('../controllers/authController');

// POST /api/auth/signup → runs the signup function
router.post('/signup', signup);

// POST /api/auth/login → runs the login function
router.post('/login', login);

module.exports = router;
