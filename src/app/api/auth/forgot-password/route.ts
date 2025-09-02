import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { emailService } from '@/lib/email-service';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, language = 'de' } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: language === 'en' ? 'Email is required' : 'E-Mail ist erforderlich' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists (security)
      return NextResponse.json({
        success: true,
        message: language === 'en' 
          ? 'If an account exists, you will receive a reset email.'
          : 'Falls ein Konto existiert, erhalten Sie eine Reset-E-Mail.'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        type: 'password_reset' 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '1h' }
    );

    // Send reset email
    const emailSent = await emailService.sendPasswordResetEmail(
      email, 
      resetToken, 
      language as 'de' | 'en'
    );

    return NextResponse.json({
      success: true,
      message: language === 'en'
        ? 'Password reset email sent. Check your inbox.'
        : 'Reset-E-Mail gesendet. Prüfen Sie Ihr Postfach.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}