const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { randomBytes } = require('crypto');

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL_PROJECT || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 1,
  connectionTimeoutMillis: 10000,
});

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password, name, company } = req.body || {};

  try {
    if (action === 'register') {
      // Validation
      if (!email || !password || !name) {
        return res.status(400).json({
          error: 'Email, password and name are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: 'Password must be at least 6 characters'
        });
      }

      const client = await pool.connect();

      try {
        // Check if user exists
        const existingUser = await client.query(
          'SELECT id FROM "User" WHERE email = $1',
          [email]
        );

        if (existingUser.rows.length > 0) {
          return res.status(400).json({
            error: 'User with this email already exists'
          });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate URL-safe user ID
        const userId = `user_${Date.now()}_${randomBytes(8).toString('base64url')}`;

        // Create user
        const result = await client.query(
          `INSERT INTO "User" (id, email, password, name, company, plan, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
           RETURNING id, email, name, company, plan, "createdAt", "updatedAt"`,
          [userId, email, hashedPassword, name, company || null, 'free']
        );

        const user = result.rows[0];

        return res.json({
          success: true,
          user,
          message: 'Registration successful!'
        });

      } finally {
        client.release();
      }

    } else if (action === 'login') {
      // Demo user
      if (email === 'demo@gastrotools.de' && password === 'demo123') {
        // URL-safe JWT token
        const token = jwt.sign(
          { userId: 'demo-user-123', email, plan: 'free' },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d', algorithm: 'HS256' }
        );

        return res.json({
          success: true,
          user: { id: 'demo-user-123', email, name: 'Demo User', plan: 'free' },
          token,
          message: 'Login successful'
        });
      }

      // Regular user login logic here...
      return res.status(401).json({ error: 'Invalid credentials' });

    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({
      error: `Failed: ${error.message || 'Unknown error'}`
    });
  }
};