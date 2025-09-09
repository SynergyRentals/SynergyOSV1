import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { unit_id, ota, date, views, clicks, conversion_rate, search_rank, wishlists, page_position, source_ts } = body;

    if (!unit_id || !ota || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields: unit_id, ota, date' 
      }, { status: 400 });
    }

    const unit = await prisma.unit.findUnique({
      where: { id: unit_id }
    });

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 });
    }

    const metricsData = {
      unitId: unit_id,
      ota,
      date: new Date(date),
      views: views || 0,
      clicks: clicks || 0,
      conversionRate: conversion_rate || 0,
      searchRank: search_rank || null,
      wishlists: wishlists || 0,
      pagePosition: page_position || null
    };

    const metrics = await prisma.otaMetricsDaily.upsert({
      where: { 
        unitId_ota_date: { 
          unitId: unit_id, 
          ota, 
          date: new Date(date) 
        } 
      },
      update: metricsData,
      create: metricsData
    });

    return NextResponse.json({ 
      success: true, 
      metricsId: metrics.id,
      message: 'OTA metrics ingested successfully'
    });

  } catch (error) {
    console.error('OTA metrics ingest error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
