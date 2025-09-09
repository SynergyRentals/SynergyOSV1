import { NextRequest, NextResponse } from 'next/server';
import { webhookSecurity } from '@/lib/webhook-security';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate new webhook secret
    const newSecret = await webhookSecurity.generateWebhookSecret();

    // Update user's webhook secret
    await prisma.user.update({
      where: { id: userId },
      data: { 
        guestyWebhookSecret: newSecret,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      secret: newSecret,
      message: 'Webhook secret generated successfully',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Webhook secret generation error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate webhook secret',
        success: false 
      },
      { status: 500 }
    );
  }
}
