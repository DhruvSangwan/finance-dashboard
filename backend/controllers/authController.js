// =============================================================
// AUTH CONTROLLER (controllers/authController.js)
// Controllers contain the business logic — what actually
// happens when someone hits a route like POST /api/auth/login
// =============================================================

const bcrypt = require('bcrypt');   // For hashing passwords
const jwt = require('jsonwebtoken'); // For creating login tokens
const db = require('../config/db'); // Our database connection

// ---------------------------------------------------------------
// SIGNUP: Create a new user account
// POST /api/auth/signup
// Body: { name, email, password }
// ---------------------------------------------------------------
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // --- Input validation ---
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if email is already registered
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()] // Store emails in lowercase for consistency
    );
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    // Hash the password — NEVER store plain text passwords!
    // bcrypt adds a random "salt" so the same password hashes differently each time
    // The number 12 is the "cost factor" — higher = slower = more secure
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user into the database
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, name, email`,
      [name, email.toLowerCase(), passwordHash]
    );

    const newUser = result.rows[0];

    // Create a JWT token so the user is immediately logged in
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name }, // payload
      process.env.JWT_SECRET,  // secret key
      { expiresIn: '7d' }      // token expires in 7 days
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
};

// ---------------------------------------------------------------
// LOGIN: Authenticate an existing user
// POST /api/auth/login
// Body: { email, password }
// ---------------------------------------------------------------
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Look up the user by email
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    const user = result.rows[0];

    // Use a vague error message — don't reveal if email exists or not
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare the submitted password against the stored hash
    // bcrypt.compare handles the salt automatically
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

module.exports = { signup, login };
