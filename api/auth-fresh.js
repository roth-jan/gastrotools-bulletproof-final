const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

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

      // Use fresh DATABASE_URL with new password
      const freshUrl = process.env.DATABASE_URL_FRESH;
      
      if (!freshUrl) {
        return res.status(500).json({ error: 'Fresh database URL not configured' });
      }

      console.log('Using fresh DATABASE_URL_FRESH');

      // Direct connection with fresh credentials
      const client = new Client({
        connectionString: freshUrl,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();
        console.log('✅ Fresh database connection successful');

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

        // Generate user ID
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
          message: 'Registration successful with fresh credentials!'
        });

      } finally {
        await client.end();
      }

    } else if (action === 'login') {
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
      }

      // Demo user (priority)
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
          message: 'Demo login successful'
        });
      }

      // Regular user login with fresh database
      const freshUrl = process.env.DATABASE_URL_FRESH;
      
      if (!freshUrl) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const client = new Client({
        connectionString: freshUrl,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();

        // Find user
        const result = await client.query(
          'SELECT id, email, password, name, company, plan FROM "User" WHERE email = $1',
          [email]
        );

        if (result.rows.length === 0) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
          { userId: user.id, email: user.email, plan: user.plan },
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d' }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return res.json({
          success: true,
          user: userWithoutPassword,
          token,
          message: 'Login successful'
        });

      } finally {
        await client.end();
      }
    }

    return res.status(400).json({ error: 'Invalid action' });

  } catch (error) {
    console.error('Fresh auth error:', error);
    return res.status(500).json({
      error: `Failed: ${error.message || 'Unknown'}`
    });
  }
};