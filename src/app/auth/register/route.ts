import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

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

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company,
        plan: 'free',
      }
    });

    // FIXED: Initialize usage tracking properly - create individual entries per tool
    const currentMonth = new Date().toISOString().slice(0, 7);
    const tools = ['naehrwert', 'speisekarten', 'kostenkontrolle', 'lagerverwaltung', 'menueplaner'];

    for (const tool of tools) {
      await prisma.usageTracking.create({
        data: {
          userId: user.id,
          tool: tool,
          count: 0,
          month: currentMonth,
        }
      });
    }

    // Return success
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Registration successful! You can now sign in.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}