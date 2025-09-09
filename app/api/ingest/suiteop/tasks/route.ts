import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { external_id, unit_id, type, status, due_at, assigned_to, details, source_ts } = body;

    if (!external_id || !unit_id || !type) {
      return NextResponse.json({ 
        error: 'Missing required fields: external_id, unit_id, type' 
      }, { status: 400 });
    }

    const unit = await prisma.unit.findUnique({
      where: { id: unit_id }
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    const taskData = {
      unitId: unit_id,
      type,
      status: status || 'todo',
      dueAt: due_at ? new Date(due_at) : null,
      assignedTo: assigned_to || null,
      detailsJson: { 
        external_id, 
        details: details || '',
        source: 'suiteop'
      },
      source: 'suiteop'
    };

    const task = await prisma.task.create({
      data: taskData
    });

    return NextResponse.json({ 
      success: true, 
      taskId: task.id,
      message: 'SuiteOp task ingested successfully'
    });

  } catch (error) {
    console.error('SuiteOp task ingest error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
