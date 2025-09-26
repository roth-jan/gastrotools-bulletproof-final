import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getTranslation } from '@/lib/translations';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Demo user - no database needed
    if (email === 'demo@gastrotools.de' && password === 'demo123') {
      const token = jwt.sign(
        { 
          userId: 'demo-user-123',
          email: email,
          plan: 'free'
        },
        process.env.JWT_SECRET || 'local-development-secret-key',
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        success: true,
        user: {
          id: 'demo-user-123',
          email: email,
          name: getTranslation('auth.login.demo_user', 'en'),
          plan: 'free'
        },
        token
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Ungültige Anmeldedaten' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: getTranslation('auth.login.failed', 'en'), details: error instanceof Error ? error.message : getTranslation('api.errors.unknown_error', 'en') },
      { status: 500 }
    );
  }
}