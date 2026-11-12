# AUTOMULA

**Supporting product name:** FormPilot AI  
**Tagline:** Understand forms. Prepare answers. Fill with confidence.

AUTOMULA is a web platform and browser assistant for preparing and filling online forms from a user's own verified knowledge.

## Product capabilities
- Secure user accounts and personal profile.
- Structured knowledge base for education, experience, skills, projects, and reusable answers.
- Private document library.
- AI answer suggestions grounded in user-owned knowledge.
- Browser extension for form detection, review, approved filling, and verification.
- Application history and reusable field mappings.

## Development status
Work is delivered in phases on `phase-1-foundation`; `main` is intentionally preserved until review and verification.

- Phase 1: repository foundation, initial dashboard shell, extension field detection, shared contracts, initial database migration.
- Phase 2: authenticated web workspace, profile and knowledge management, document and project workflows.
- Phase 3: browser extension integration and website adapters.
- Phase 4: grounded AI answer generation and review.
- Phase 5: approved field filling, verification, and application history.
- Phase 6: security hardening, automated tests, and deployment.

## Local development
1. Install Node.js 20+ and pnpm 10+.
2. Copy `.env.example` to `apps/web/.env.local`.
3. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `OPENAI_API_KEY`.
4. Run `pnpm install`.
5. Run `pnpm --filter @automula/web dev`.

Supabase migrations are in `supabase/migrations`. Apply them only to the dedicated AUTOMULA project, not to unrelated projects.

## Safety
AUTOMULA never submits a form automatically, bypasses CAPTCHA/MFA, collects passwords or payment-card details as reusable knowledge, or executes model-generated code. Users review and approve suggested values before filling.
