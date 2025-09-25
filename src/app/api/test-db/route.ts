export const runtime = 'nodejs';

export async function POST() {
  try {
    // Test database connection
    const { Pool } = await import('pg');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL_PROJECT,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    await pool.end();

    return new Response(JSON.stringify({
      success: true,
      database: 'connected',
      time: result.rows[0].now
    }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({
      error: `DB Test failed: ${error?.message}`
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}