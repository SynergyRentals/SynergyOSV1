import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample units
  const units = await Promise.all([
    prisma.unit.create({
      data: {
        unitCode: 'TG-001',
        unitName: 'Tower Grove Loft',
        bedrooms: 1,
        bathrooms: 1,
        sleeps: 2,
        address: '3456 Arsenal St, St. Louis, MO 63118',
        lat: 38.6103,
        lon: -90.2348,
        mgmtModel: 'full_service',
        market: 'St. Louis, MO',
        microMarket: 'Tower Grove',
        active: true,
        tags: ['loft', 'historic', 'walkable'],
        externalIds: {
          guesty_id: 'guesty_tg001',
          wheelhouse_id: 'wh_tg001',
          airbnb_id: 'airbnb_tg001'
        }
      }
    }),
    prisma.unit.create({
      data: {
        unitCode: 'SL-002',
        unitName: 'Soulard Townhouse',
        bedrooms: 2,
        bathrooms: 2,
        sleeps: 4,
        address: '1234 Russell Blvd, St. Louis, MO 63104',
        lat: 38.6195,
        lon: -90.2023,
        mgmtModel: 'full_service',
        market: 'St. Louis, MO',
        microMarket: 'Soulard',
        active: true,
        tags: ['townhouse', 'historic', 'brewery_district'],
        externalIds: {
          guesty_id: 'guesty_sl002',
          wheelhouse_id: 'wh_sl002',
          airbnb_id: 'airbnb_sl002'
        }
      }
    }),
    prisma.unit.create({
      data: {
        unitCode: 'CWE-003',
        unitName: 'Central West End Penthouse',
        bedrooms: 3,
        bathrooms: 2.5,
        sleeps: 6,
        address: '789 Euclid Ave, St. Louis, MO 63108',
        lat: 38.6441,
        lon: -90.2594,
        mgmtModel: 'full_service',
        market: 'St. Louis, MO',
        microMarket: 'Central West End',
        active: true,
        tags: ['penthouse', 'luxury', 'downtown'],
        externalIds: {
          guesty_id: 'guesty_cwe003',
          wheelhouse_id: 'wh_cwe003',
          airbnb_id: 'airbnb_cwe003'
        }
      }
    })
  ]);

  console.log(`✅ Created ${units.length} units`);

  // Create sample listings for each unit
  const listings = [];
  for (const unit of units) {
    const otas = ['airbnb', 'vrbo', 'booking'];
    for (const ota of otas) {
      const listing = await prisma.listing.create({
        data: {
          unitId: unit.id,
          ota,
          listingId: `${ota}_${unit.unitCode.toLowerCase()}`,
          status: 'active',
          title: `${unit.unitName} - ${ota.toUpperCase()}`,
          description: `Beautiful ${unit.bedrooms}BR/${unit.bathrooms}BA in ${unit.microMarket}`,
          amenitiesJson: {
            wifi: true,
            kitchen: true,
            parking: ota === 'airbnb',
            pool: unit.microMarket === 'Central West End'
          },
          minStay: ota === 'airbnb' ? 2 : 3,
          maxStay: 30,
          cleaningFee: unit.bedrooms * 50,
          cancellationPolicy: 'moderate'
        }
      });
      listings.push(listing);
    }
  }

  console.log(`✅ Created ${listings.length} listings`);

  // Create sample reservations (last 60 days + next 60 days)
  const reservations = [];
  const today = new Date();
  
  for (const unit of units) {
    // Past reservations
    for (let i = 0; i < 8; i++) {
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() - (60 - i * 7));
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + (2 + Math.floor(Math.random() * 4)));
      
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const baseRate = unit.bedrooms * 80 + Math.random() * 50;
      
      const reservation = await prisma.reservation.create({
        data: {
          unitId: unit.id,
          source: 'guesty',
          externalId: `res_${unit.unitCode}_${i}`,
          status: 'completed',
          checkIn,
          checkOut,
          nights,
          guests: Math.min(unit.sleeps, 2 + Math.floor(Math.random() * 3)),
          adr: baseRate,
          totalPayout: baseRate * nights * 0.85, // After fees
          hostFee: baseRate * nights * 0.03,
          taxes: baseRate * nights * 0.12,
          cleaningFee: unit.bedrooms * 50,
          leadTimeDays: Math.floor(Math.random() * 30) + 7
        }
      });
      reservations.push(reservation);
    }

    // Future reservations
    for (let i = 0; i < 6; i++) {
      const checkIn = new Date(today);
      checkIn.setDate(today.getDate() + (i * 10) + 5);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkIn.getDate() + (2 + Math.floor(Math.random() * 4)));
      
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const baseRate = unit.bedrooms * 80 + Math.random() * 50;
      
      const reservation = await prisma.reservation.create({
        data: {
          unitId: unit.id,
          source: 'guesty',
          externalId: `res_${unit.unitCode}_future_${i}`,
          status: 'confirmed',
          checkIn,
          checkOut,
          nights,
          guests: Math.min(unit.sleeps, 2 + Math.floor(Math.random() * 3)),
          adr: baseRate,
          totalPayout: baseRate * nights * 0.85,
          hostFee: baseRate * nights * 0.03,
          taxes: baseRate * nights * 0.12,
          cleaningFee: unit.bedrooms * 50,
          leadTimeDays: Math.floor((checkIn.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        }
      });
      reservations.push(reservation);
    }
  }

  console.log(`✅ Created ${reservations.length} reservations`);

  // Create 90-day calendar for each unit
  const calendarDays = [];
  for (const unit of units) {
    for (let i = -30; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const basePrice = unit.bedrooms * 80 + Math.random() * 40;
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const weekendMultiplier = isWeekend ? 1.3 : 1.0;
      
      const calendarDay = await prisma.calendarDay.create({
        data: {
          unitId: unit.id,
          date,
          available: Math.random() > 0.3, // 70% availability
          basePrice: basePrice * weekendMultiplier,
          minPrice: basePrice * weekendMultiplier * 0.8,
          maxPrice: basePrice * weekendMultiplier * 1.5,
          source: 'guesty'
        }
      });
      calendarDays.push(calendarDay);
    }
  }

  console.log(`✅ Created ${calendarDays.length} calendar days`);

  // Create sample OTA metrics
  const otaMetrics = [];
  const otas = ['airbnb', 'vrbo', 'booking'];
  
  for (const unit of units) {
    for (const ota of otas) {
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const metrics = await prisma.otaMetricsDaily.create({
          data: {
            unitId: unit.id,
            ota,
            date,
            views: Math.floor(Math.random() * 50) + 10,
            clicks: Math.floor(Math.random() * 15) + 2,
            conversionRate: Math.random() * 0.1 + 0.02,
            searchRank: Math.floor(Math.random() * 20) + 1,
            wishlists: Math.floor(Math.random() * 5),
            pagePosition: Math.floor(Math.random() * 3) + 1
          }
        });
        otaMetrics.push(metrics);
      }
    }
  }

  console.log(`✅ Created ${otaMetrics.length} OTA metrics`);

  // Create sample playbooks
  const playbooks = await Promise.all([
    prisma.playbook.create({
      data: {
        scope: 'module',
        module: 'Revenue',
        title: 'Revenue Optimization Playbook',
        bodyMd: `# Revenue Optimization Playbook

## Overview
This playbook outlines strategies for maximizing revenue per unit through dynamic pricing and demand optimization.

## Key Strategies
1. **Dynamic Pricing**: Adjust rates based on demand, seasonality, and local events
2. **Length of Stay Optimization**: Encourage longer stays with discounts
3. **Last-Minute Pricing**: Implement aggressive pricing for unsold inventory

## Triggers
- Occupancy drops below 70% for next 14 days
- ADR falls below market average
- Competitor pricing changes detected

## Actions
- Review and adjust base rates
- Implement promotional pricing
- Update minimum stay requirements`,
        version: 1,
        status: 'active',
        tags: ['revenue', 'pricing', 'optimization']
      }
    }),
    prisma.playbook.create({
      data: {
        scope: 'module',
        module: 'Ops',
        title: 'Operations Excellence Playbook',
        bodyMd: `# Operations Excellence Playbook

## Overview
Standard operating procedures for maintaining high-quality guest experiences and operational efficiency.

## Pre-Arrival
- [ ] Confirm cleaning completion 24h before check-in
- [ ] Send welcome message with check-in instructions
- [ ] Verify all amenities are functional

## During Stay
- [ ] Monitor for maintenance requests
- [ ] Respond to guest messages within 2 hours
- [ ] Check for noise complaints or issues

## Post-Departure
- [ ] Conduct property inspection
- [ ] Process damage claims if necessary
- [ ] Update calendar availability`,
        version: 1,
        status: 'active',
        tags: ['operations', 'guest-experience', 'maintenance']
      }
    })
  ]);

  console.log(`✅ Created ${playbooks.length} playbooks`);

  // Create sample agent recommendations
  const recommendations = await Promise.all([
    prisma.agentRecommendation.create({
      data: {
        scope: 'unit',
        unitId: units[0].id,
        module: 'Revenue',
        title: 'Increase Base Rate for Tower Grove Loft',
        bodyMd: `Based on recent market analysis, I recommend increasing the base rate for TG-001 by 12%.

**Analysis:**
- Current ADR: $95/night
- Market average: $108/night  
- Occupancy: 85% (above target)
- Recent competitor rate increases: 8-15%

**Recommendation:**
Increase base rate from $95 to $107/night effective immediately.`,
        recommendationJson: {
          current_rate: 95,
          recommended_rate: 107,
          increase_percentage: 12.6,
          market_data: {
            avg_adr: 108,
            occupancy_rate: 0.85
          }
        },
        confidence: 0.87,
        status: 'open',
        createdByAgentId: 'revenue-copilot-001'
      }
    }),
    prisma.agentRecommendation.create({
      data: {
        scope: 'unit',
        unitId: units[1].id,
        module: 'Ops',
        title: 'Schedule Deep Clean for Soulard Townhouse',
        bodyMd: `Recent guest feedback indicates cleanliness concerns. Recommend scheduling deep clean.

**Guest Feedback Analysis:**
- 3 mentions of "dusty surfaces" in last 2 weeks
- Cleaning score: 4.2/5 (below 4.5 target)
- Last deep clean: 6 weeks ago

**Action Items:**
1. Schedule deep clean within 48 hours
2. Review cleaning checklist with team
3. Consider increasing cleaning frequency`,
        recommendationJson: {
          cleaning_score: 4.2,
          target_score: 4.5,
          last_deep_clean_days_ago: 42,
          guest_mentions: 3
        },
        confidence: 0.92,
        status: 'open',
        createdByAgentId: 'ops-coordinator-001'
      }
    }),
    prisma.agentRecommendation.create({
      data: {
        scope: 'unit',
        unitId: units[2].id,
        module: 'Ranking',
        title: 'Optimize Photos for Central West End Penthouse',
        bodyMd: `Photo optimization opportunity detected for improved search ranking.

**Current Performance:**
- Average search rank: 15th position
- Click-through rate: 2.1% (below 3% target)
- Photo score: 6.8/10

**Recommendations:**
1. Add professional exterior shots
2. Highlight unique penthouse features
3. Include neighborhood amenity photos
4. Optimize photo order for mobile viewing`,
        recommendationJson: {
          current_rank: 15,
          target_rank: 8,
          ctr: 0.021,
          photo_score: 6.8,
          missing_photo_types: ["exterior", "neighborhood", "amenities"]
        },
        confidence: 0.78,
        status: 'open',
        createdByAgentId: 'ranking-optimizer-001'
      }
    })
  ]);

  console.log(`✅ Created ${recommendations.length} agent recommendations`);

  // Create rent data for pricing floors
  const rentData = await Promise.all([
    prisma.rentData.create({
      data: {
        unitId: units[0].id,
        unitCode: units[0].unitCode,
        monthlyRent: 1200,
        flatOpex: 700,
        expectedOcc: 75,
        targetMargin: 10
      }
    }),
    prisma.rentData.create({
      data: {
        unitId: units[1].id,
        unitCode: units[1].unitCode,
        monthlyRent: 1800,
        flatOpex: 700,
        expectedOcc: 75,
        targetMargin: 10
      }
    }),
    prisma.rentData.create({
      data: {
        unitId: units[2].id,
        unitCode: units[2].unitCode,
        monthlyRent: 2800,
        flatOpex: 700,
        expectedOcc: 75,
        targetMargin: 10
      }
    })
  ]);

  console.log(`✅ Created ${rentData.length} rent data records`);

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'synergyrentalstl@gmail.com',
        name: 'Synergy Admin',
        role: 'Admin',
        active: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'analyst@synergy.com',
        name: 'Revenue Analyst',
        role: 'Analyst',
        active: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'ops@synergy.com',
        name: 'Operations Manager',
        role: 'Ops',
        active: true
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
