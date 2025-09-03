import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '@/lib/auth-utils';

// Force Node.js Runtime (not Edge)
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Demo user handling
    if (email === 'demo@gastrotools.de' && password === 'demo123') {
      const demoUser = {
        id: 'demo-user-123',
        email: 'demo@gastrotools.de',
        name: 'Demo User',
        plan: 'free'
      };

      const token = generateToken(demoUser);

      const response = NextResponse.json({
        success: true,
        user: demoUser,
        token,
        message: 'Demo login successful'
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    }

    // Regular user login from Neon database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      plan: user.plan
    });

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Login successful'
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: `Login failed: ${error?.message || 'Authentication error'}` },
      { status: 500 }
    );
  }
}