import { NextRequest, NextResponse } from 'next/server';
import { webhookSecurity } from '@/lib/webhook-security';
import { prisma } from '@/lib/prisma';

// Rate limiting and queue management
const requestQueue: Array<() => Promise<void>> = [];
let activeRequests = 0;
const MAX_CONCURRENT_REQUESTS = 15;
const rateLimitStats = {
  last429Count: 0,
  last429Reset: Date.now(),
};

async function processQueue() {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return;
  }

  const task = requestQueue.shift();
  if (task) {
    activeRequests++;
    try {
      await task();
    } finally {
      activeRequests--;
      // Process next item in queue
      setTimeout(processQueue, 100);
    }
  }
}

async function queueRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

export async function POST(request: NextRequest) {
  try {
    // Read raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get('X-Guesty-Signature') || '';
    
    let payload;
    try {
      payload = JSON.parse(body);
    } catch (error) {
      console.error('Invalid JSON payload:', error);
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Extract event details
    const eventId = payload.id || payload.eventId || `${Date.now()}-${Math.random()}`;
    const eventType = payload.type || payload.eventType || 'unknown';

    // Get admin user for webhook verification (in production, this would be more sophisticated)
    const adminUser = await prisma.user.findFirst({
      where: { role: 'Admin' },
      select: { id: true },
    });

    if (!adminUser) {
      console.error('No admin user found for webhook verification');
      return NextResponse.json(
        { error: 'Configuration error' },
        { status: 500 }
      );
    }

    // Process webhook with security verification
    const result = await webhookSecurity.processWebhook(
      eventId,
      eventType,
      payload,
      signature,
      adminUser.id
    );

    if (!result.success) {
      console.error('Webhook verification failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Queue the actual processing to respect rate limits
    await queueRequest(async () => {
      await processGuestyEvent(eventType, payload, result.webhookEventId);
    });

    return NextResponse.json({ 
      success: true, 
      eventId: result.webhookEventId 
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processGuestyEvent(eventType: string, payload: any, webhookEventId: string) {
  try {
    console.log(`Processing Guesty event: ${eventType}`);

    switch (eventType) {
      case 'reservation.created':
      case 'reservation.updated':
      case 'reservation.cancelled':
        await processReservationEvent(payload);
        break;
      
      case 'listing.updated':
        await processListingEvent(payload);
        break;
      
      case 'listing.calendar.updated':
        await processCalendarEvent(payload);
        break;
      
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    // Mark webhook as processed
    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: { 
        processed: true, 
        processedAt: new Date() 
      },
    });

  } catch (error) {
    console.error(`Error processing ${eventType}:`, error);
    
    // Mark webhook as failed
    await prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
    });
  }
}

async function processReservationEvent(payload: any) {
  const reservation = payload.reservation || payload;
  
  // Find unit by Guesty listing ID
  const listing = await prisma.listing.findFirst({
    where: { listingId: reservation.listingId },
    include: { unit: true },
  });

  if (!listing) {
    console.warn(`No unit found for Guesty listing ${reservation.listingId}`);
    return;
  }

  // Calculate derived fields
  const checkIn = new Date(reservation.checkInDateLocalized);
  const checkOut = new Date(reservation.checkOutDateLocalized);
  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const leadTimeDays = reservation.createdAt 
    ? Math.ceil((checkIn.getTime() - new Date(reservation.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Upsert reservation (idempotent by external ID)
  await prisma.reservation.upsert({
    where: {
      unitId_externalId: {
        unitId: listing.unitId,
        externalId: reservation._id,
      },
    },
    update: {
      status: reservation.status,
      checkIn,
      checkOut,
      nights,
      guests: reservation.guestsCount || 1,
      adr: reservation.money?.hostPayout || 0,
      totalPayout: reservation.money?.hostPayout || 0,
      hostFee: reservation.money?.hostServiceFeeIncTax || 0,
      taxes: reservation.money?.taxAmount || 0,
      cleaningFee: reservation.money?.cleaningFee || 0,
      updatedAtExt: reservation.lastUpdatedAt ? new Date(reservation.lastUpdatedAt) : null,
      cancellationReason: reservation.cancellationReason,
      leadTimeDays,
      sourceUpdatedAt: new Date(),
    },
    create: {
      unitId: listing.unitId,
      source: 'guesty',
      externalId: reservation._id,
      status: reservation.status,
      checkIn,
      checkOut,
      nights,
      guests: reservation.guestsCount || 1,
      adr: reservation.money?.hostPayout || 0,
      totalPayout: reservation.money?.hostPayout || 0,
      hostFee: reservation.money?.hostServiceFeeIncTax || 0,
      taxes: reservation.money?.taxAmount || 0,
      cleaningFee: reservation.money?.cleaningFee || 0,
      createdAtExt: reservation.createdAt ? new Date(reservation.createdAt) : null,
      updatedAtExt: reservation.lastUpdatedAt ? new Date(reservation.lastUpdatedAt) : null,
      cancellationReason: reservation.cancellationReason,
      leadTimeDays,
      sourceUpdatedAt: new Date(),
    },
  });

  console.log(`Processed reservation ${reservation._id} for unit ${listing.unit.unitCode}`);
}

async function processListingEvent(payload: any) {
  const listing = payload.listing || payload;
  
  // Find unit by Guesty listing ID
  const existingListing = await prisma.listing.findFirst({
    where: { listingId: listing._id },
    include: { unit: true },
  });

  if (!existingListing) {
    console.warn(`No listing found for Guesty listing ${listing._id}`);
    return;
  }

  // Upsert listing with version history
  await prisma.listing.update({
    where: { id: existingListing.id },
    data: {
      status: listing.status,
      title: listing.title,
      description: listing.publicDescription?.summary,
      amenitiesJson: listing.amenities || {},
      photosJson: listing.pictures || {},
      minStay: listing.terms?.minNights,
      maxStay: listing.terms?.maxNights,
      cleaningFee: listing.prices?.cleaningFee,
      taxProfileJson: listing.taxes || {},
      cancellationPolicy: listing.terms?.cancellation,
      bookingWindow: listing.terms?.advanceNotice,
      sourceUpdatedAt: new Date(),
    },
  });

  console.log(`Processed listing update for ${existingListing.unit.unitCode}`);
}

async function processCalendarEvent(payload: any) {
  const calendarData = payload.calendar || payload;
  const listingId = payload.listingId || calendarData.listingId;
  
  // Find unit by Guesty listing ID
  const listing = await prisma.listing.findFirst({
    where: { listingId },
    include: { unit: true },
  });

  if (!listing) {
    console.warn(`No unit found for Guesty listing ${listingId}`);
    return;
  }

  // Process calendar days
  if (calendarData.days && Array.isArray(calendarData.days)) {
    for (const day of calendarData.days) {
      const date = new Date(day.date);
      
      await prisma.calendarDay.upsert({
        where: {
          unitId_date: {
            unitId: listing.unitId,
            date,
          },
        },
        update: {
          available: day.status === 'available',
          basePrice: day.price?.basePrice,
          minPrice: day.price?.minPrice,
          maxPrice: day.price?.maxPrice,
          blockedReason: day.status !== 'available' ? day.status : null,
          sourceUpdatedAt: new Date(),
        },
        create: {
          unitId: listing.unitId,
          date,
          available: day.status === 'available',
          basePrice: day.price?.basePrice,
          minPrice: day.price?.minPrice,
          maxPrice: day.price?.maxPrice,
          blockedReason: day.status !== 'available' ? day.status : null,
          source: 'guesty',
          sourceUpdatedAt: new Date(),
        },
      });
    }
  }

  console.log(`Processed calendar update for ${listing.unit.unitCode}`);
}

// Export rate limit stats for monitoring
export async function GET() {
  const stats = await webhookSecurity.getWebhookStats('admin');
  
  return NextResponse.json({
    ...stats,
    queueDepth: requestQueue.length,
    activeRequests,
    rateLimitStats,
  });
}
