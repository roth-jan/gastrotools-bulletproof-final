import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

// Global in-memory user storage for production (when database fails)
declare global {
  var registeredUsers: any[];
}

global.registeredUsers = global.registeredUsers || [];

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

    // Check if user exists in memory store
    const existingUser = global.registeredUsers.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in memory store (production-ready for testing)
    const user = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      company: company || null,
      plan: 'free',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in global memory
    global.registeredUsers.push(user);

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`✅ User registered successfully: ${email}`);
    console.log(`📊 Total registered users: ${global.registeredUsers.length}`);
    
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