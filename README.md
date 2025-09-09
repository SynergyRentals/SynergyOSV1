# Synergy OS - Rental Management Platform

A comprehensive single-tenant rental management platform built for Synergy Rentals Group.

## 🏗️ Architecture

- **Next.js 14** with App Router and TypeScript
- **Prisma ORM** with PostgreSQL database
- **shadcn/ui** components with Tailwind CSS
- **Responsive design** with mobile-friendly navigation

## 🚀 Features

### Core Platform
- **Post-Setup Checklist** - Interactive onboarding flow
- **Portfolio Dashboard** - KPIs, occupancy trends, channel mix
- **Units Management** - Property portfolio with filtering and health scores
- **Admin Panel** - Complete system configuration

### API Integrations
- **Guesty** - Primary PMS integration with webhook handling
- **Wheelhouse** - Dynamic pricing data ingestion
- **OTA Metrics** - Performance tracking across platforms
- **SuiteOp** - Task management integration
- **Conduit** - Message summarization

### Database Schema
- Units, Listings, Reservations, Calendar Days
- OTA Metrics, Agent Recommendations, Playbooks
- KPI Snapshots, Tasks, Issues, Rent Data
- User management with role-based permissions

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/SynergyRentals/SynergyOSV1.git
   cd SynergyOSV1
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your `.env` file with:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/synergy_os"
   GUESTY_WEBHOOK_SECRET="your-webhook-secret"
   WHEELHOUSE_API_KEY="your-wheelhouse-key"
   OTA_SCRAPER_API_KEY="your-ota-scraper-key"
   SUITEOP_API_KEY="your-suiteop-key"
   CONDUIT_API_KEY="your-conduit-key"
   ```

4. **Set up the database**
   ```bash
   # Create database
   createdb synergy_os
   
   # Run migrations
   bun prisma migrate dev
   
   # Seed with sample data
   bun prisma db seed
   ```

5. **Start the development server**
   ```bash
   bun dev
   ```

## 📊 Sample Data

The application comes pre-seeded with sample data for 3 St. Louis properties:
- **TG-001** - Tower Grove Loft (1BR/1BA)
- **SL-002** - Soulard Townhouse (2BR/2BA) 
- **CWE-003** - Central West End Penthouse (3BR/2.5BA)

## 🔌 API Endpoints

### Webhooks
- `POST /api/webhooks/guesty` - Guesty event processing

### Data Ingestion
- `POST /api/ingest/wheelhouse/unit_pricing` - Pricing updates
- `POST /api/ingest/ota/metrics` - OTA performance data
- `POST /api/ingest/suiteop/tasks` - Task management sync
- `POST /api/ingest/conduit/messages_summary` - Message summaries

### Agent System
- `GET/POST /api/agents/recommendations` - AI recommendations
- `GET /api/agents/kpis` - Performance metrics
- `POST /api/agents/action_logs` - Action tracking

## 🎨 UI Components

Built with shadcn/ui components including:
- Dashboard with KPI cards and charts
- Data tables with filtering and sorting
- Forms with validation
- Navigation with responsive sidebar
- Admin panels with tabbed interfaces

## 🔐 Authentication & Permissions

- Role-based access control (Admin, Analyst, Operations)
- API key management for external integrations
- Webhook signature verification

## 🚀 Deployment

The application is deployed at: https://synergy-os-dev.lindy.site

For production deployment:
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your preferred platform (Vercel, Railway, etc.)

## 📝 License

Private repository for Synergy Rentals Group internal use.
