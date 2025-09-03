import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

// Force Node.js Runtime (not Edge)
export const runtime = 'nodejs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in Neon database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company,
        plan: 'free',
      }
    });

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`✅ User registered successfully: ${email}`);
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Registration successful! You can now sign in.'
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: `Registration failed: ${error?.message || 'Database error'}` },
      { status: 500 }
    );
  }
}