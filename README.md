# AUTOMULA

**Supporting product name:** FormPilot AI  
**Tagline:** Understand forms. Prepare answers. Fill with confidence.

AUTOMULA is a web platform and browser assistant for preparing and filling online forms from a user's own verified knowledge.

## Product capabilities
- Secure user accounts and personal profile.
- Structured knowledge base for education, experience, skills, projects, and reusable answers.
- Private document library.
- AI answer suggestions grounded in user-owned knowledge and source references.
- Browser extension for form detection, review, approved filling, and verification.
- Application history and reusable field mappings.

## Development status
Work is delivered in phases on `phase-1-foundation`; `main` is intentionally preserved until review and verification.

- Phase 1: repository foundation, initial dashboard shell, extension field detection, shared contracts, initial database migration.
- Phase 2: authenticated web workspace, profile and knowledge management, private document and project workflows.
- Phase 3: AI answer studio, source-grounded suggestions, and session persistence.
- Phase 4: browser extension authentication and website adapters.
- Phase 5: approved field filling, verification, and application history.
- Phase 6: security hardening, automated tests, and deployment.

## Local development
1. Install Node.js 22+ and pnpm 10+.
2. Copy `.env.example` to `apps/web/.env.local`.
3. Set Supabase URL and publishable key for a dedicated AUTOMULA project.
4. For local AI requests, set an AI Gateway API key. Vercel deployments can use Vercel OIDC.
5. Run `pnpm install`.
6. Run `pnpm --filter @automula/web dev`.

Apply migrations in `supabase/migrations` only to the dedicated AUTOMULA project.

## Safety
AUTOMULA never submits a form automatically, bypasses CAPTCHA/MFA, collects passwords or payment-card details as reusable knowledge, or executes model-generated code. Users review and approve suggested values before filling.
