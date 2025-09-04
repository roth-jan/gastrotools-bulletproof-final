const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 3000;

// CORS for GastroTools frontend
app.use(cors({
  origin: [
    'https://gastrotools-bulletproof.vercel.app',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Health check
app.get('/healthz', (req, res) => {
  res.json({ 
    ok: true, 
    service: 'gastrotools-backend',
    timestamp: new Date().toISOString() 
  });
});

// Database connection test
app.get('/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_user, current_database(), NOW()');
    client.release();
    
    res.json({ 
      ok: true, 
      database: 'connected',
      info: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message 
    });
  }
});

// User registration
app.post('/register', async (req, res) => {
  try {
    const { email, password, name, company } = req.body || {};

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

      // Generate user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create user
      const result = await client.query(
        `INSERT INTO "User" (id, email, password, name, company, plan, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
         RETURNING id, email, name, company, plan, "createdAt", "updatedAt"`,
        [userId, email, hashedPassword, name, company || null, 'free']
      );

      const user = result.rows[0];

      console.log(`✅ User registered successfully: ${email}`);

      res.json({
        success: true,
        user,
        message: 'Registration successful! You can now sign in.'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: `Registration failed: ${error.message}`
    });
  }
});

// User login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Demo user handling
    if (email === 'demo@gastrotools.de' && password === 'demo123') {
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@gastrotools.de',
        name: 'Demo User',
        plan: 'free'
      };

      const token = jwt.sign(
        { userId: demoUser.id, email: demoUser.email, plan: demoUser.plan },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        user: demoUser,
        token,
        message: 'Demo login successful'
      });
    }

    const client = await pool.connect();

    try {
      // Find user
      const result = await client.query(
        'SELECT id, email, password, name, company, plan FROM "User" WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      const user = result.rows[0];

      // Check password
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          error: 'Invalid credentials'
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email, plan: user.plan },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword,
        token,
        message: 'Login successful'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: `Login failed: ${error.message}`
    });
  }
});

app.listen(port, () => {
  console.log(`🚀 GastroTools Backend running on port ${port}`);
  console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Configured' : 'Not configured'}`);
});