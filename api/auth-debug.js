module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // DEBUG: Test raw DATABASE_URL without any processing
    const rawUrl = process.env.DATABASE_URL;
    
    if (!rawUrl) {
      return res.status(500).json({ error: 'DATABASE_URL not set' });
    }

    // Test if URL is valid without normalization
    try {
      const testUrl = new URL(rawUrl);
      console.log('✅ Raw URL is valid:', testUrl.hostname);
    } catch (urlError) {
      return res.status(500).json({ 
        error: `Raw URL invalid: ${urlError.message}` 
      });
    }

    // Test basic pg connection without any URL manipulation
    const { Client } = require('pg');
    
    const client = new Client({
      connectionString: rawUrl, // Direct - no processing
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    const result = await client.query('SELECT 1 as test');
    await client.end();

    return res.json({
      success: true,
      message: 'Direct database connection successful',
      test: result.rows[0]
    });

  } catch (error) {
    return res.status(500).json({
      error: `Debug failed: ${error.message}`
    });
  }
};