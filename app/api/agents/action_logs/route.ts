import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { actor_type, actor_id, action, payload_json, result, context_ref } = body;

    if (!actor_type || !actor_id || !action) {
      return NextResponse.json({ 
        error: 'Missing required fields: actor_type, actor_id, action' 
      }, { status: 400 });
    }

    const actionLog = await prisma.agentActionLog.create({
      data: {
        actorType: actor_type,
        actorId: actor_id,
        action,
        payloadJson: payload_json || {},
        result: result || null,
        contextRef: context_ref || null
      }
    });

    return NextResponse.json({ 
      success: true, 
      actionLogId: actionLog.id,
      message: 'Action log created successfully'
    });

  } catch (error) {
    console.error('Agent action log creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
