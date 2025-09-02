import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

interface UserPayload {
  userId: string;
  email: string;
  plan: string;
}

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  plan: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    const cookieToken = request.cookies.get('auth-token')?.value;
    
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    
    // Demo user special handling
    if (decoded.userId === 'demo-user-123') {
      return {
        id: 'demo-user-123',
        email: 'demo@gastrotools.de',
        name: 'Demo User',
        plan: 'free'
      };
    }

    return {
      id: decoded.userId,
      email: decoded.email,
      plan: decoded.plan
    };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}

export function generateToken(user: { id: string; email: string; plan: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      plan: user.plan
    },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}