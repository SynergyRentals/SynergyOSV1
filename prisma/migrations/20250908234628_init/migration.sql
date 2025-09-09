-- CreateTable
CREATE TABLE "public"."integration_source" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook_event" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error" TEXT,

    CONSTRAINT "webhook_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit" (
    "id" TEXT NOT NULL,
    "externalIds" JSONB NOT NULL DEFAULT '{}',
    "unitCode" TEXT NOT NULL,
    "unitName" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" DOUBLE PRECISION NOT NULL,
    "sleeps" INTEGER NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,
    "mgmtModel" TEXT,
    "market" TEXT NOT NULL,
    "microMarket" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."listing" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "ota" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "amenitiesJson" JSONB,
    "photosJson" JSONB,
    "minStay" INTEGER,
    "maxStay" INTEGER,
    "cleaningFee" DOUBLE PRECISION,
    "taxProfileJson" JSONB,
    "cancellationPolicy" TEXT,
    "bookingWindow" INTEGER,
    "leadTimeDaysMedian" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."calendar_day" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "available" BOOLEAN NOT NULL,
    "minPrice" DOUBLE PRECISION,
    "maxPrice" DOUBLE PRECISION,
    "basePrice" DOUBLE PRECISION,
    "blockedReason" TEXT,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "calendar_day_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."reservation" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "checkIn" DATE NOT NULL,
    "checkOut" DATE NOT NULL,
    "nights" INTEGER NOT NULL,
    "guests" INTEGER NOT NULL,
    "adr" DOUBLE PRECISION NOT NULL,
    "totalPayout" DOUBLE PRECISION NOT NULL,
    "hostFee" DOUBLE PRECISION,
    "taxes" DOUBLE PRECISION,
    "cleaningFee" DOUBLE PRECISION,
    "createdAtExt" TIMESTAMP(3),
    "updatedAtExt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "leadTimeDays" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pricing_settings" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "minPrice" DOUBLE PRECISION NOT NULL,
    "maxPrice" DOUBLE PRECISION NOT NULL,
    "discountsJson" JSONB,
    "overridesJson" JSONB,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sourceUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "pricing_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."task" (
    "id" TEXT NOT NULL,
    "unitId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "dueAt" TIMESTAMP(3),
    "assignedTo" TEXT,
    "createdBy" TEXT,
    "detailsJson" JSONB,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."issue" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "description" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "issue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."kpi_snapshot_daily" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "occ" DOUBLE PRECISION,
    "adr" DOUBLE PRECISION,
    "revpar" DOUBLE PRECISION,
    "revenue" DOUBLE PRECISION,
    "pacingVsTarget" DOUBLE PRECISION,
    "targetOcc" DOUBLE PRECISION,
    "targetAdr" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_snapshot_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_calendar" (
    "id" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "name" TEXT NOT NULL,
    "demandImpact" TEXT,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_calendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ota_metrics_daily" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "ota" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "views" INTEGER,
    "clicks" INTEGER,
    "conversionRate" DOUBLE PRECISION,
    "searchRank" INTEGER,
    "wishlists" INTEGER,
    "pagePosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ota_metrics_daily_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_recommendation" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "unitId" TEXT,
    "module" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "recommendationJson" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdByAgentId" TEXT NOT NULL,
    "appliedByUserId" TEXT,
    "appliedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."agent_action_log" (
    "id" TEXT NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "payloadJson" JSONB,
    "result" TEXT,
    "contextRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_action_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."playbook" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "unitId" TEXT,
    "module" TEXT,
    "title" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."playbook_task_template" (
    "id" TEXT NOT NULL,
    "playbookId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructionsMd" TEXT NOT NULL,
    "checklistJson" JSONB,
    "assigneeRole" TEXT,
    "canAutorun" BOOLEAN NOT NULL DEFAULT false,
    "agentTriggerRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playbook_task_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'Analyst',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_key" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."app_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."rent_data" (
    "id" TEXT NOT NULL,
    "unitId" TEXT,
    "unitCode" TEXT,
    "monthlyRent" DOUBLE PRECISION NOT NULL,
    "flatOpex" DOUBLE PRECISION NOT NULL DEFAULT 700,
    "expectedOcc" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "targetMargin" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rent_data_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "integration_source_name_key" ON "public"."integration_source"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unit_unitCode_key" ON "public"."unit"("unitCode");

-- CreateIndex
CREATE UNIQUE INDEX "listing_unitId_ota_key" ON "public"."listing"("unitId", "ota");

-- CreateIndex
CREATE UNIQUE INDEX "calendar_day_unitId_date_key" ON "public"."calendar_day"("unitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_unitId_externalId_key" ON "public"."reservation"("unitId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_snapshot_daily_unitId_date_key" ON "public"."kpi_snapshot_daily"("unitId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ota_metrics_daily_unitId_ota_date_key" ON "public"."ota_metrics_daily"("unitId", "ota", "date");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_keyHash_key" ON "public"."api_key"("keyHash");

-- CreateIndex
CREATE UNIQUE INDEX "app_config_key_key" ON "public"."app_config"("key");

-- CreateIndex
CREATE UNIQUE INDEX "rent_data_unitCode_key" ON "public"."rent_data"("unitCode");

-- AddForeignKey
ALTER TABLE "public"."listing" ADD CONSTRAINT "listing_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."calendar_day" ADD CONSTRAINT "calendar_day_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."reservation" ADD CONSTRAINT "reservation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pricing_settings" ADD CONSTRAINT "pricing_settings_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."issue" ADD CONSTRAINT "issue_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."kpi_snapshot_daily" ADD CONSTRAINT "kpi_snapshot_daily_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ota_metrics_daily" ADD CONSTRAINT "ota_metrics_daily_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."agent_recommendation" ADD CONSTRAINT "agent_recommendation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."playbook" ADD CONSTRAINT "playbook_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."playbook_task_template" ADD CONSTRAINT "playbook_task_template_playbookId_fkey" FOREIGN KEY ("playbookId") REFERENCES "public"."playbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
