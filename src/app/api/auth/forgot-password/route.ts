import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { emailService } from '@/lib/email-service';
import { getTranslation } from '@/lib/translations';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, language = 'de' } = await request.json();

    // Validation
    if (!email) {
      return NextResponse.json(
        { error: getTranslation('auth.forgot_password.email_required', language as 'en' | 'de') },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal if email exists (security)
      return NextResponse.json({
        success: true,
        message: getTranslation('auth.forgot_password.account_exists_message', language as 'en' | 'de')
      });
    }

    // Generate reset token (expires in 1 hour)
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

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: getTranslation('auth.forgot_password.email_sent', language as 'en' | 'de')
      });
    } else {
      return NextResponse.json(
        { error: getTranslation('auth.forgot_password.email_service_error', language as 'en' | 'de') },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: getTranslation('api.errors.internal_server_error', 'en') },
      { status: 500 }
    );
  }
}