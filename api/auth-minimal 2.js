const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, email, password, name, company } = req.body || {};

  try {
    if (action === 'register') {
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

      // MINIMAL: Direct connection string without URL parsing
      const rawUrl = process.env.DATABASE_URL;
      console.log('Raw DATABASE_URL exists:', !!rawUrl);
      
      if (!rawUrl) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      // Direct connection without URL manipulation
      const client = new Client({
        connectionString: rawUrl,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();
        console.log('✅ Database connection successful');

        // Test basic query
        await client.query('SELECT 1');

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

        // Simple user ID
        const userId = `user_${Date.now()}`;

        // Create user
        const result = await client.query(
          `INSERT INTO "User" (id, email, password, name, company, plan, "createdAt", "updatedAt") 
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
           RETURNING id, email, name, company, plan`,
          [userId, email, hashedPassword, name, company || null, 'free']
        );

        const user = result.rows[0];

        return res.json({
          success: true,
          user,
          message: 'Registration successful!'
        });

      } finally {
        await client.end();
      }

    } else if (action === 'login') {
      // Demo user only for now
      if (email === 'demo@gastrotools.de' && password === 'demo123') {
        const token = jwt.sign(
          { userId: 'demo-user-123', email, plan: 'free' },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d' }
        );

        return res.json({
          success: true,
          user: { id: 'demo-user-123', email, name: 'Demo User', plan: 'free' },
          token,
          message: 'Login successful'
        });
      }

      return res.status(401).json({ error: 'Invalid credentials' });
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Minimal auth error:', error);
    return res.status(500).json({
      error: `Failed: ${error.message || 'Unknown'}`
    });
  }
};