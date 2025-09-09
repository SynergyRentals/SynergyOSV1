import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { scope, unit_id, module, title, body_md, recommendation_json, confidence, created_by_agent_id } = body;

    // Validate required fields
    if (!scope || !module || !title || !body_md || confidence === undefined || !created_by_agent_id) {
      return NextResponse.json({ 
        error: 'Missing required fields: scope, module, title, body_md, confidence, created_by_agent_id' 
      }, { status: 400 });
    }

    // Validate confidence range
    if (confidence < 0 || confidence > 1) {
      return NextResponse.json({ 
        error: 'Confidence must be between 0 and 1' 
      }, { status: 400 });
    }

    // Validate unit exists if unit_id provided
    if (unit_id) {
      const unit = await prisma.unit.findUnique({
        where: { id: unit_id }
      });
      if (!unit) {
        return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
      }
    }

    // Create recommendation
    const recommendation = await prisma.agentRecommendation.create({
      data: {
        scope,
        unitId: unit_id || null,
        module,
        title,
        bodyMd: body_md,
        recommendationJson: recommendation_json || {},
        confidence,
        status: 'open',
        createdByAgentId: created_by_agent_id
      }
    });

    return NextResponse.json({ 
      success: true, 
      recommendationId: recommendation.id,
      message: 'Recommendation created successfully'
    });

  } catch (error) {
    console.error('Agent recommendation creation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const module = searchParams.get('module');
    const status = searchParams.get('status');
    const unitId = searchParams.get('unit_id');
    const confidence = searchParams.get('confidence');

    let where: any = {};
    
    if (module) where.module = module;
    if (status) where.status = status;
    if (unitId) where.unitId = unitId;
    if (confidence) {
      const confidenceNum = parseFloat(confidence);
      if (confidenceNum <= 0.5) {
        where.confidence = { lte: 0.5 };
      } else if (confidenceNum <= 0.75) {
        where.confidence = { gt: 0.5, lte: 0.75 };
      } else {
        where.confidence = { gt: 0.75 };
      }
    }

    const recommendations = await prisma.agentRecommendation.findMany({
      where,
      include: {
        unit: {
          select: {
            unitCode: true,
            unitName: true,
            market: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      recommendations 
    });

  } catch (error) {
    console.error('Agent recommendations fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
