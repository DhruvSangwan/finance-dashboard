// =============================================================
// AUTH MIDDLEWARE (middleware/auth.js)
// Middleware = a function that runs BETWEEN the request arriving
// and the route handler running. Like a security checkpoint.
//
// This checks: "Does this request have a valid login token?"
// If yes → continue to the route. If no → reject with 401.
// =============================================================

const jwt = require('jsonwebtoken');

// This function is the middleware itself
// Express middleware always receives: req, res, next
// - req: the incoming request (has headers, body, etc.)
// - res: the outgoing response
// - next: a function to call to continue to the next step
const authenticateToken = (req, res, next) => {
  
  // Tokens are sent in the "Authorization" header like:
  // Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
  const authHeader = req.headers['authorization'];
  
  // Split "Bearer TOKEN" → ["Bearer", "TOKEN"] and grab index 1
  const token = authHeader && authHeader.split(' ')[1];

  // If no token was sent, reject the request
  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please log in.' });
  }

  // Verify the token using the same secret we used to create it
  // jwt.verify() throws an error if the token is fake or expired
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is invalid or expired.' });
    }
    
    // Token is valid! Attach the user info to the request
    // Now any route using this middleware can access req.user
    req.user = user; // Contains: { id, email, name }
    
    next(); // Continue to the actual route handler
  });
};

module.exports = authenticateToken;
