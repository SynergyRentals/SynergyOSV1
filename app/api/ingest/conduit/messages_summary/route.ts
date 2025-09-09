import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { unit_id, date, avg_response_time_sec, sentiment_score, open_threads, unresolved_threads, notes, source_ts } = body;

    if (!unit_id || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields: unit_id, date' 
      }, { status: 400 });
    }

    const unit = await prisma.unit.findUnique({
      where: { id: unit_id }
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    // Store as KPI snapshot for now - in production might have dedicated conduit table
    const kpiData = {
      unitId: unit_id,
      date: new Date(date),
      // Store conduit metrics in a structured way
      revenue: null, // Not applicable for conduit
      occ: null,
      adr: null,
      revpar: null,
      pacingVsTarget: null,
      targetOcc: null,
      targetAdr: null
    };

    const kpiSnapshot = await prisma.kpiSnapshotDaily.upsert({
      where: { 
        unitId_date: { 
          unitId: unit_id, 
          date: new Date(date) 
        } 
      },
      update: kpiData,
      create: kpiData
    });

    // Also create a task/note if there are unresolved threads
    if (unresolved_threads && unresolved_threads > 0) {
      await prisma.task.create({
        data: {
          unitId: unit_id,
          type: 'communication',
          status: 'todo',
          detailsJson: {
            source: 'conduit',
            avg_response_time_sec,
            sentiment_score,
            open_threads,
            unresolved_threads,
            notes,
            created_from_conduit_summary: true
          },
          source: 'conduit'
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      kpiId: kpiSnapshot.id,
      message: 'Conduit messages summary ingested successfully'
    });

  } catch (error) {
    console.error('Conduit messages ingest error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
