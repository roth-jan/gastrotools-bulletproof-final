export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET() {
  try {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL_PROJECT || process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 1,
      connectionTimeoutMillis: 10000,
    });

    const result = await pool.query(`SELECT current_user, current_database(), inet_server_addr()`);
    await pool.end();

    return NextResponse.json({ 
      ok: true, 
      rows: result.rows,
      connectionWorking: true
    });
    
  } catch (error: any) {
    // Make error visible (without secrets)
    return NextResponse.json(
      { 
        ok: false, 
        error: error?.message || String(error),
        connectionWorking: false
      },
      { status: 500 }
    );
  }
}