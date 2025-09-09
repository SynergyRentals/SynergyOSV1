import { NextRequest, NextResponse } from 'next/server';
import { guestyOAuth } from '@/lib/guesty-oauth';
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

    // Test the connection
    const isConnected = await guestyOAuth.testConnection(userId);

    if (!isConnected) {
      return NextResponse.json(
        { error: 'Connection test failed. Please check your credentials.' },
        { status: 400 }
      );
    }

    // Update last sync time
    await prisma.user.update({
      where: { id: userId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Connection test successful',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Connection test error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Connection test failed',
        success: false 
      },
      { status: 500 }
    );
  }
}
