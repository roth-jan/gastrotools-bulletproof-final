// Completely isolated registration endpoint
export const runtime = 'nodejs';

async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs');
  return bcrypt.default.hash(password, 10);
}

export async function POST(request: Request) {
  try {
    // Parse body
    const body = await request.json();
    const { email, password, name, company } = body;

    // Validation
    if (!email || !password || !name) {
      return new Response(JSON.stringify({
        error: 'Email, password and name are required'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({
        error: 'Password must be at least 6 characters'
      }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // PostgreSQL connection
    const { Pool } = await import('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL_PROJECT || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
    });

    const client = await pool.connect();

    try {
      // Check existing user
      const existing = await client.query(
        'SELECT id FROM "User" WHERE email = $1 LIMIT 1',
        [email]
      );

      if (existing.rows.length > 0) {
        return new Response(JSON.stringify({
          error: 'User already exists'
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await client.query(
        `INSERT INTO "User" (id, email, password, name, company, plan, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, 'free', NOW(), NOW()) 
         RETURNING id, email, name, company, plan`,
        [userId, email, hashedPassword, name, company || null]
      );

      const user = result.rows[0];

      return new Response(JSON.stringify({
        success: true,
        user,
        message: 'Registration successful!'
      }), { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });

    } finally {
      client.release();
      await pool.end();
    }

  } catch (error: any) {
    console.error('Clean registration error:', error);
    return new Response(JSON.stringify({
      error: `Fehlgeschlagen: ${error?.message || 'Unknown'}`
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}