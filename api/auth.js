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

      // Use working DATABASE_URL 
      const workingUrl = process.env.DATABASE_URL_WORKING;
      
      if (!workingUrl) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      console.log('Using DATABASE_URL_WORKING');

      const client = new Client({
        connectionString: workingUrl,
        ssl: { rejectUnauthorized: false }
      });

      try {
        await client.connect();
        console.log('✅ Database connection successful');

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

        // Send welcome email (if Resend configured)
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'demo-email-service') {
          try {
            const { Resend } = require('resend');
            const resend = new Resend(process.env.RESEND_API_KEY);
            
            await resend.emails.send({
              from: 'GastroTools <noreply@resend.dev>',
              to: email,
              subject: 'Welcome to GastroTools!',
              html: `
                <h1>Welcome ${name}!</h1>
                <p>Your GastroTools account has been created successfully.</p>
                <p>You can now access all our professional restaurant management tools:</p>
                <ul>
                  <li>Nutrition Calculator</li>
                  <li>Cost Control</li>
                  <li>Inventory Management</li>
                  <li>Menu Planner</li>
                  <li>Menu Card Designer</li>
                </ul>
                <p><a href="https://gastrotools-bulletproof.vercel.app/login">Login to your account</a></p>
              `
            });
            console.log('✅ Welcome email sent');
          } catch (emailError) {
            console.log('⚠️ Email failed:', emailError.message);
          }
        }

        return res.json({
          success: true,
          user,
          message: 'Registration successful! Check your email for welcome message.'
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
          message: 'Login successful'
        });
      }

      // Regular user login
      const workingUrl = process.env.DATABASE_URL_WORKING;
      
      if (!workingUrl) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const client = new Client({
        connectionString: workingUrl,
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
    console.error('Auth error:', error);
    return res.status(500).json({
      error: `Failed: ${error.message || 'Unknown'}`
    });
  }
};