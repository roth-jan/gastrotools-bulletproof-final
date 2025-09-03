import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Pool } from 'pg';

// Force Node.js Runtime
export const runtime = 'nodejs';

// Native PostgreSQL client - PRODUCTION READY
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export async function POST(request: NextRequest) {
  let client;
  
  try {
    const { email, password, name, company } = await request.json();

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

    // Get client from pool
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

    // Generate user ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create user with native SQL - PRODUCTION READY
    const result = await client.query(
      `INSERT INTO "User" (id, email, password, name, company, plan, "createdAt", "updatedAt") 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING id, email, name, company, plan, "createdAt", "updatedAt"`,
      [userId, email, hashedPassword, name, company || null, 'free']
    );

    const user = result.rows[0];

    console.log(`✅ Native PostgreSQL registration successful: ${email}`);

    return NextResponse.json({
      success: true,
      user,
      message: 'Registration successful! You can now sign in.'
    });

  } catch (error: any) {
    console.error('Native registration error:', error);
    return NextResponse.json(
      { error: `Registration failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}