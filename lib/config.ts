export const APP_CONFIG = {
  org: {
    name: "Synergy Rentals Group",
    env: "dev",
    timezone: "America/Chicago",
    currency: "USD",
    dateFormat: "YYYY-MM-DD",
    roles: ["Admin", "Analyst", "Ops"],
    initialAdminEmails: ["synergyrentalstl@gmail.com"],
    sessionTimeoutMin: 60,
  },
  branding: {
    accentPrimaryHex: "#2563EB",
    accentSecondaryHex: "#FACC15",
    theme: ["light", "dark"],
    navLayout: "sidebar",
  },
  security: {
    minPasswordLen: 12,
    twoFactor: "optional",
    apiKeyRotationDays: 90,
    corsAllowedOrigins: ["http://localhost:3000"],
    maskGuestPiiInUi: true,
  },
  guesty: {
    authMethod: "api_key",
    apiKey: "PASTE_IN_ADMIN",
    accountId: "",
    backfill: {
      reservationsPastMonths: 24,
      reservationsFutureMonths: 12,
      calendarForwardDays: 365,
    },
    webhooks: {
      subscribeEvents: [
        "reservation.created",
        "reservation.updated", 
        "reservation.cancelled",
        "listing.updated",
        "calendar.updated",
        "pricing.updated"
      ],
      secret: "PASTE_IN_ADMIN",
      signatureHeader: "X-Guesty-Signature",
    },
    sync: {
      deltaCadence: "hourly",
      reconcileCron: "30 3 * * *",
    },
    rateLimitsRpm: 60,
    conflictPolicy: "guesty_fees_availability; wheelhouse_strategy",
  },
  pricingFloors: {
    rentSource: "sheet_upload_in_admin",
    flatOpexMonthlyDefault: 700,
    expectedOccForFloorPctDefault: 75,
    targetMarginPctDefault: 10,
    uiControls: ["slider", "dropdown"],
    autoRecomputeOnDataUpdate: true,
    priceDisplayTaxMode: "tax_inclusive",
  },
  ingest: {
    approach: "agent_post_to_endpoints_v0",
    apiKeys: {
      wheelhouse: "GENERATE_IN_ADMIN",
      ota: "GENERATE_IN_ADMIN", 
      suiteop: "GENERATE_IN_ADMIN",
      conduit: "GENERATE_IN_ADMIN",
    },
    ipAllowlist: [],
    endpoints: {
      wheelhouseUnitPricing: true,
      otaMetrics: true,
      suiteopTasks: true,
      conduitMessagesSummary: true,
    },
  },
  otas: {
    supportedChannels: ["airbnb", "vrbo", "booking"],
    metricsSource: "agent_scrape_to_ingest",
  },
  suiteop: {
    integrationMode: "agent_json_ingest_daily",
  },
  conduit: {
    payloadFields: [
      "avg_response_time_sec",
      "sentiment_score", 
      "open_threads",
      "unresolved_threads",
      "notes"
    ],
  },
  markets: {
    primary: "St. Louis, MO",
    microMarkets: ["Tower Grove", "Soulard", "Central West End"],
  },
  otaHealth: {
    weights: {
      searchRankTrend: 30,
      ctrViewsToClicks: 20,
      conversionClicksToBooking: 20,
      contentCompleteness: 15,
      reviewScoreVolume: 10,
      cancellationRate: 5,
    },
    bands: { passMin: 80, warnMin: 60 },
  },
  agents: {
    names: ["Revenue Co-Pilot", "Ops Coordinator", "Ranking Optimizer"],
    writeMode: "propose_only",
    recommendationStatuses: ["open", "queued", "applied", "dismissed"],
    confidenceBands: { lowMax: 0.5, medMax: 0.75 },
    rateLimitRpmPerKey: 300,
  },
  dataRetention: {
    versionsPerEntity: 50,
    webhookRetentionDays: 180,
  },
} as const;
