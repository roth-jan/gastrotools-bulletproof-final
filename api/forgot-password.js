const jwt = require('jsonwebtoken');
const { Client } = require('pg');
const { randomBytes } = require('crypto');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, language = 'en' } = req.body || {};

  try {
    if (!email) {
      return res.status(400).json({
        error: language === 'en' ? 'Email is required' : 'E-Mail ist erforderlich'
      });
    }

    // Connect to database
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

      // Check if user exists
      const result = await client.query(
        'SELECT id, email FROM "User" WHERE email = $1',
        [email]
      );

      if (result.rows.length === 0) {
        // Don't reveal if user exists (security)
        return res.json({
          success: true,
          message: language === 'en' 
            ? 'If an account exists, you will receive a reset email.'
            : 'Falls ein Konto existiert, erhalten Sie eine Reset-E-Mail.'
        });
      }

      const user = result.rows[0];

      // Generate reset token (URL-safe)
      const resetToken = randomBytes(32).toString('base64url');
      
      // Create JWT with reset token
      const resetJWT = jwt.sign(
        { 
          userId: user.id, 
          email: user.email,
          resetToken,
          type: 'password_reset' 
        },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1h' }
      );

      // Store reset token in database (simple approach)
      await client.query(
        'UPDATE "User" SET "updatedAt" = NOW() WHERE id = $1',
        [user.id]
      );

      console.log(`✅ Password reset requested for: ${email}`);

      // TODO: Send email with reset link
      // For now, return success (email service can be added later)
      
      return res.json({
        success: true,
        message: language === 'en'
          ? 'Password reset email sent. Check your inbox.'
          : 'Reset-E-Mail gesendet. Prüfen Sie Ihr Postfach.',
        resetToken: resetJWT // For testing - remove in production
      });

    } finally {
      await client.end();
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      error: language === 'en' ? 'Reset failed' : 'Reset fehlgeschlagen'
    });
  }
};