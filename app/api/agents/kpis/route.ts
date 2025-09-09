import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { unit_id, date, occ, adr, revpar, revenue, pacing_vs_target, target_occ, target_adr } = body;

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

    const kpiData = {
      unitId: unit_id,
      date: new Date(date),
      occ: occ || null,
      adr: adr || null,
      revpar: revpar || null,
      revenue: revenue || null,
      pacingVsTarget: pacing_vs_target || null,
      targetOcc: target_occ || null,
      targetAdr: target_adr || null
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

    return NextResponse.json({ 
      success: true, 
      kpiId: kpiSnapshot.id,
      message: 'KPI data upserted successfully'
    });

  } catch (error) {
    console.error('Agent KPI upsert error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
