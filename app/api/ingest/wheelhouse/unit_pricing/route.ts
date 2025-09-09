import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { unit_id, wheelhouse_id, date, base_price, min_price, max_price, overrides, discounts, source_ts } = body;

    // Validate required fields
    if (!unit_id || !date || base_price === undefined) {
      return NextResponse.json({ 
        error: 'Missing required fields: unit_id, date, base_price' 
      }, { status: 400 });
    }

    // Find unit
    const unit = await prisma.unit.findUnique({
      where: { id: unit_id }
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    // Update unit external IDs if wheelhouse_id provided
    if (wheelhouse_id) {
      const currentExternalIds = unit.externalIds as any || {};
      await prisma.unit.update({
        where: { id: unit_id },
        data: {
          externalIds: {
            ...currentExternalIds,
            wheelhouse_id
          }
        }
      });
    }

    // Create pricing settings record
    const pricingData = {
      unitId: unit_id,
      basePrice: base_price,
      minPrice: min_price || base_price * 0.7,
      maxPrice: max_price || base_price * 2.0,
      discountsJson: discounts || {},
      overridesJson: overrides || {},
      source: 'wheelhouse',
      sourceUpdatedAt: source_ts ? new Date(source_ts) : new Date()
    };

    const pricingSetting = await prisma.pricingSettings.create({
      data: pricingData
    });

    return NextResponse.json({ 
      success: true, 
      pricingId: pricingSetting.id,
      message: 'Pricing data ingested successfully'
    });

  } catch (error) {
    console.error('Wheelhouse pricing ingest error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
