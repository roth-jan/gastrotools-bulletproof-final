import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Force Node.js Runtime
export const runtime = 'nodejs';

// Simple global storage for testing
declare global {
  var users: any[];
}

global.users = global.users || [];

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, company } = await request.json();

    // Basic validation
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
    const existingUser = global.users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      company: company || null,
      plan: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store user
    global.users.push(user);

    // Return success
    const { password: _, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Registration successful! You can now sign in.'
    });

  } catch (error: any) {
    console.error('Simple registration error:', error);
    return NextResponse.json(
      { error: `Registration failed: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}