import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('X-Guesty-Signature');
    
    // Parse JSON payload
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }

    // Get webhook secret from config (in real app, from database)
    const webhookSecret = process.env.GUESTY_WEBHOOK_SECRET;
    
    // Verify signature if secret is configured
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      if (signature !== `sha256=${expectedSignature}`) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // Store webhook event
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        source: 'guesty',
        eventType: payload.type || 'unknown',
        payloadJson: payload,
        status: 'received'
      }
    });

    // Process webhook based on event type
    await processGuestyWebhook(payload, webhookEvent.id);

    return NextResponse.json({ 
      success: true, 
      eventId: webhookEvent.id 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

async function processGuestyWebhook(payload: any, eventId: string) {
  try {
    const eventType = payload.type;
    
    switch (eventType) {
      case 'reservation.created':
      case 'reservation.updated':
        await processReservationEvent(payload.data);
        break;
      case 'reservation.cancelled':
        await processCancellationEvent(payload.data);
        break;
      case 'listing.updated':
        await processListingEvent(payload.data);
        break;
      case 'calendar.updated':
        await processCalendarEvent(payload.data);
        break;
      case 'pricing.updated':
        await processPricingEvent(payload.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    // Mark event as processed
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { 
        status: 'processed',
        processedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Mark event as failed
    await prisma.webhookEvent.update({
      where: { id: eventId },
      data: { 
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
}

async function processReservationEvent(data: any) {
  const unitId = await findUnitByGuestyId(data.listingId);
  if (!unitId) return;

  const reservationData = {
    unitId,
    source: 'guesty',
    externalId: data._id,
    status: data.status,
    checkIn: new Date(data.checkInDateLocalized),
    checkOut: new Date(data.checkOutDateLocalized),
    nights: data.nightsCount,
    guests: data.guestsCount,
    adr: data.money.hostPayout / data.nightsCount,
    totalPayout: data.money.hostPayout,
    hostFee: data.money.hostServiceFee,
    taxes: data.money.tax,
    cleaningFee: data.money.cleaningFee,
    createdAtExt: new Date(data.createdAt),
    updatedAtExt: new Date(data.lastUpdatedAt),
    leadTimeDays: Math.floor((new Date(data.checkInDateLocalized).getTime() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    sourceUpdatedAt: new Date()
  };

  await prisma.reservation.upsert({
    where: { unitId_externalId: { unitId, externalId: data._id } },
    update: reservationData,
    create: reservationData
  });
}

async function processCancellationEvent(data: any) {
  const unitId = await findUnitByGuestyId(data.listingId);
  if (!unitId) return;

  await prisma.reservation.updateMany({
    where: { 
      unitId,
      externalId: data._id 
    },
    data: { 
      status: 'cancelled',
      cancellationReason: data.cancellationReason,
      sourceUpdatedAt: new Date()
    }
  });
}

async function processListingEvent(data: any) {
  const unitId = await findUnitByGuestyId(data._id);
  if (!unitId) return;

  const listingData = {
    unitId,
    ota: data.platform || 'guesty',
    listingId: data._id,
    status: data.status,
    title: data.title,
    description: data.publicDescription?.summary,
    amenitiesJson: data.amenities || {},
    photosJson: data.pictures || {},
    minStay: data.terms?.minNights,
    maxStay: data.terms?.maxNights,
    cleaningFee: data.prices?.cleaningFee,
    taxProfileJson: data.taxes || {},
    cancellationPolicy: data.terms?.cancellation,
    sourceUpdatedAt: new Date()
  };

  await prisma.listing.upsert({
    where: { unitId_ota: { unitId, ota: data.platform || 'guesty' } },
    update: listingData,
    create: listingData
  });
}

async function processCalendarEvent(data: any) {
  const unitId = await findUnitByGuestyId(data.listingId);
  if (!unitId) return;

  for (const day of data.days || []) {
    const calendarData = {
      unitId,
      date: new Date(day.date),
      available: day.status === 'available',
      minPrice: day.price?.minimum,
      maxPrice: day.price?.maximum,
      basePrice: day.price?.base,
      blockedReason: day.status !== 'available' ? day.status : null,
      source: 'guesty',
      sourceUpdatedAt: new Date()
    };

    await prisma.calendarDay.upsert({
      where: { unitId_date: { unitId, date: new Date(day.date) } },
      update: calendarData,
      create: calendarData
    });
  }
}

async function processPricingEvent(data: any) {
  const unitId = await findUnitByGuestyId(data.listingId);
  if (!unitId) return;

  const pricingData = {
    unitId,
    basePrice: data.basePrice,
    minPrice: data.minPrice,
    maxPrice: data.maxPrice,
    discountsJson: data.discounts || {},
    overridesJson: data.overrides || {},
    source: 'guesty',
    sourceUpdatedAt: new Date()
  };

  await prisma.pricingSettings.create({
    data: pricingData
  });
}

async function findUnitByGuestyId(guestyId: string): Promise<string | null> {
  const unit = await prisma.unit.findFirst({
    where: {
      externalIds: {
        path: ['guesty_id'],
        equals: guestyId
      }
    }
  });
  
  return unit?.id || null;
}
