# AUTOMULA / FormPilot AI Roadmap

## Phase 1 — Foundation (current)
- [x] Establish product identity and safety boundaries.
- [x] Create pnpm monorepo structure.
- [x] Add initial web application shell.
- [x] Add shared contracts and extension manifest foundation.
- [ ] Configure Supabase project and secrets.
- [ ] Add CI checks and verify build in a configured environment.

## Phase 2 — User identity and knowledge
- Supabase Auth and secure session handling.
- Profile, projects, verified knowledge items, and private documents.
- Document extraction and source attribution.
- Strict row-level security and storage policies.

## Phase 3 — Browser extension
- Manifest V3 service worker and side panel.
- Explicit per-site activation and permissions.
- Generic HTML form detection and stable field identifiers.
- Google Forms adapter.
- Typed extension-to-backend protocol.

## Phase 4 — Grounded AI suggestions
- Question classification and retrieval.
- Structured answer generation with Zod validation.
- Evidence references, confidence labels, conflict detection.
- Unsupported-answer handling and user review.

## Phase 5 — Safe filling and verification
- Fill only user-approved fields.
- Preserve existing values unless explicitly authorized.
- Verify each field and report failures.
- Never click final submission controls.

## Phase 6 — Hardening and release
- RLS and cross-user isolation tests.
- Extension and dashboard end-to-end tests.
- Rate limiting, retention, export, and deletion controls.
- Chrome packaging and deployment documentation.

## Definition of MVP complete
A user can create a profile, add verified knowledge, open a supported Google Form, inspect detected questions, receive source-grounded suggestions, edit and approve them, fill the page, verify results, and review the saved session. The extension never submits the form.
