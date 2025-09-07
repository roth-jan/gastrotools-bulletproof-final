# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

GastroTools is an enterprise-grade restaurant management suite that serves as both a standalone application and an intelligent lead generation system for three SaaS products: WebMenü (school/institutional catering), KüchenManager (professional kitchen management), and EAR (meal delivery services). The application implements sophisticated user intelligence and behavioral targeting to convert free tool usage into premium SaaS subscriptions.

## Architecture Overview

### Application Structure
- **Next.js 15.3.4 App Router** with TypeScript and Tailwind CSS
- **Enterprise-grade business intelligence** with registration-based user segmentation
- **Smart upselling system** using behavioral triggers and personalized messaging
- **Multi-authentication flows** including magic-link and OAuth (Google/Microsoft)
- **GDPR-compliant consent management** with granular privacy controls

### Core Business Model
The application implements a sophisticated freemium-to-SaaS conversion funnel:
1. **Freeware Value Creation** → Users get immediate value from 5 professional tools
2. **Registration-Based Intelligence** → Auto-segmentation via email domain + company analysis
3. **Behavioral Analytics** → Tool usage + export actions → intent scoring + perfect timing
4. **Smart Upselling** → Personalized SaaS recommendations after value-proof moments
5. **SaaS Conversion** → Segment-specific landing pages with transparent pricing

## Key Commands

### Development
```bash
npm run dev          # Start development server
npm run build        # Build production (includes Prisma generate)
npm start           # Start production server  
npm run lint        # Run ESLint
```

### Testing
```bash
npm run test                    # Run Playwright tests
npx playwright test            # All tests
npx playwright test --headed   # Visual testing mode
npx playwright test tests/enterprise-features.spec.js  # Specific test file
npx playwright test --reporter=line                    # Minimal output
```

### Database (Prisma)
```bash
npm run db:push      # Push schema to database
npm run db:seed      # Seed with demo data
npx prisma generate  # Generate client (included in build)
npx prisma studio    # Database browser
```

## Enterprise Business Logic

### User Intelligence System
The core differentiator is the `UserIntelligence` class in `src/lib/user-intelligence.ts` which implements:
- **Auto-segmentation**: Email domain + company name → WebMenü/KüchenManager/EAR classification
- **Behavioral scoring**: Tool usage + export actions → intent levels + timing optimization
- **Personalized messaging**: Company-specific SaaS benefits + ROI messaging

### Smart Upselling Architecture
The `SmartUpsellV2` component (`src/components/SmartUpsell-v2.tsx`) implements:
- **Trigger-based activation**: `export_succeeded`, `menu_items_created`, `value_proven`
- **Frequency capping**: 7-day localStorage-based intelligent spacing
- **Role-based targeting**: Decision-maker identification (schulleitung, geschäftsführung, küchenleitung)
- **Mobile-responsive positioning**: Top-center (mobile), bottom-right (desktop)

### SaaS Conversion Funnels
Three dedicated conversion paths:
- `/webmenue` → Schools/kitas (BuT-integration, online ordering, cashless payment)
- `/kuechenmanager` → Professional kitchens (LMIV compliance, DATEV integration, inventory)
- `/essen-auf-raedern` → Delivery services (route planning, transparent Starterpakete pricing)

## Authentication Architecture

### Multi-Modal Authentication
- **Standard registration**: Name + email + company + role (for segmentation)
- **Magic-link authentication**: Passwordless flow with auto-segmentation
- **OAuth integration**: Google/Microsoft with progressive profiling
- **Demo user**: `demo@gastrotools.de` / `demo123` (enhanced with mock data for testing)

### User Context Management
User data is enriched post-registration for business intelligence:
```typescript
// Demo user enhancement for testing enterprise features
if (user.email === 'demo@gastrotools.de') {
  user.company = 'Demo Restaurant GmbH'
  user.role = 'Geschäftsführung'  
  user.orgType = 'Restaurant'
}
```

## Tool-Specific Implementation Notes

### PDF Export System
Located in `src/app/speisekarten-designer/page.tsx`:
- **Simple text download** (avoids browser compatibility issues)
- **Professional formatting** with restaurant-grade layout
- **Smart upselling trigger** (2-second delay after successful export)
- **User instructions** for manual PDF conversion via Word/Google Docs

### Smart Trigger Conditions
```typescript
// Enterprise trigger logic in SmartUpsell-v2.tsx
const triggers = {
  export_succeeded: context === 'pdf_export_success',
  menu_items_created: behavior.menuItemsPlanned >= 1,
  cost_entries_added: behavior.costEntriesAdded >= 3,
  value_proven: behavior.exportActions >= 1
}
```

### Rate Limiting & Security
Enterprise middleware (`src/middleware.ts`) implements:
- **Multi-tier rate limiting**: PDF exports (10/min), registrations (5/hour), API calls (120/min)
- **Suspicious activity detection**: Automated blocking for abuse patterns
- **Security headers**: XSS protection, frame options, CSP policies

## Business Analytics

### Event Tracking Schema
Key business events in `src/lib/smart-triggers.ts`:
- `tool_opened` → Initial engagement
- `aha_reached` → Value creation moments (recipes, menus, cost entries)
- `export_clicked` → High-intent conversion moments
- `lead_submitted` → Email capture with segmentation
- `demo_requested` → SaaS conversion attempts

### Analytics Dashboard
`/analytics` provides business intelligence:
- **Lead attribution**: Which tools generate best SaaS customers
- **Segment performance**: WebMenü vs KüchenManager vs EAR conversion rates
- **User journey mapping**: Registration → usage → upselling → conversion
- **Revenue attribution**: MRR tracking + average deal size analysis

## Deployment Considerations

### Vercel Configuration
- **Build command**: Includes Prisma generation for database schema
- **Environment variables**: JWT_SECRET, DATABASE_URL, GOOGLE_CLIENT_ID required
- **Performance optimization**: Compression + security headers in `next.config.js`
- **Route consistency**: Canonical redirects (/ear → /essen-auf-raedern)

### GDPR Compliance
Consent management system (`src/components/ConsentManager.tsx`):
- **Granular consent**: Necessary, analytics, marketing, personalization
- **User rights implementation**: Data export, deletion, modification (Articles 17, 20)
- **Consent logging**: Timestamped records with 3-year retention

## Testing Strategy

### Playwright Testing Limitations
- **USDA API timing**: Requires 8+ second waits for nutrition data
- **Smart upselling**: Demo user vs real user behavior differences
- **PDF downloads**: Browser security restrictions affect automated testing
- **OAuth flows**: Require manual verification in test environments

### Enterprise Feature Testing
Smart features require specific test conditions:
- **Real user registration** (not demo) for full segmentation
- **Behavioral triggers** (tool usage + export actions) for upselling
- **Browser environment** (incognito mode recommended for cache-free testing)

## Business Model Integration

The application's primary value is the intelligent conversion from free tool usage to premium SaaS subscriptions. Key integration points:
- **Registration forms** capture segmentation data (company, role, org type)
- **Tool usage analytics** build behavioral profiles for targeting
- **Export moments** trigger personalized SaaS recommendations
- **Landing page routing** delivers segment-specific conversion experiences

This business intelligence approach generates significantly higher conversion rates than traditional lead capture methods by leveraging user context and behavioral data for precise targeting.