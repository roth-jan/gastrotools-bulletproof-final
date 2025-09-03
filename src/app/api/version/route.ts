export const runtime = 'nodejs';
import { NextResponse } from 'next/server';

export async function GET() {
  const env = process.env.VERCEL_ENV || 'unknown';
  const url = process.env.VERCEL_URL || 'unknown';
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || 'unknown';

  const cs = process.env.DATABASE_URL || '';
  const csProject = process.env.DATABASE_URL_PROJECT || '';
  
  // Safely mask connection strings
  let masked = 'not set';
  let maskedProject = 'not set';
  
  if (cs) {
    try {
      const u = new URL(cs);
      masked = `${u.username}@${u.hostname}${u.pathname}`;
    } catch {
      masked = 'invalid format';
    }
  }
  
  if (csProject) {
    try {
      const u = new URL(csProject);
      maskedProject = `${u.username}@${u.hostname}${u.pathname}`;
    } catch {
      maskedProject = 'invalid format';
    }
  }

  return NextResponse.json({ 
    env, 
    url, 
    sha, 
    databaseTarget: masked,
    databaseProjectTarget: maskedProject,
    timestamp: new Date().toISOString()
  });
}