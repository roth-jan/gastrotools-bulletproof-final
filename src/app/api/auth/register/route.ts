import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Force Node.js Runtime
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, password, name, company } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Dynamic import to avoid compilation issues
    const { Pool } = await import('pg');
    
    // Create PostgreSQL connection
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL_PROJECT || process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    let client;
    try {
      client = await pool.connect();

      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM "User" WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate unique user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Insert user into database
      const result = await client.query(
        `INSERT INTO "User" (id, email, password, name, company, plan, "createdAt", "updatedAt") 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
         RETURNING id, email, name, company, plan, "createdAt", "updatedAt"`,
        [userId, email, hashedPassword, name, company || null, 'free']
      );

      const user = result.rows[0];

      return NextResponse.json({
        success: true,
        user,
        message: 'Registration successful! You can now sign in.'
      });

    } finally {
      if (client) {
        client.release();
      }
      await pool.end();
    }

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: `Registration failed: ${error?.message || error?.toString() || 'Unknown error'}` },
      { status: 500 }
    );
  }
}