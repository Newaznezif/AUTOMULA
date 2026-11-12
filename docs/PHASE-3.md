# Phase 3 — AI Answer Studio

## Implemented
- AI Gateway-backed structured answer generation.
- Retrieval from the authenticated user's profile, verified knowledge items, and project records.
- Per-answer source IDs, confidence labels, and review flags.
- Conservative validation: unknown sources are removed; unsupported answers remain blank; high confidence is downgraded when unverified evidence is used.
- Form session, detected fields, and answer suggestions are persisted.
- Form Studio for manual end-to-end testing.
- User can edit suggestions and explicitly approve them.

## Model and authentication
- Default model: `openai/gpt-4.1-mini`, selected from the live Vercel AI Gateway catalog for structured output and cost efficiency.
- Vercel deployments use OIDC.
- Local development requires `AI_GATEWAY_API_KEY`.
- `AI_GATEWAY_MODEL` can override the default with a model ID returned by the live Gateway catalog.

## Still pending
- Document text extraction and embedding/indexing.
- Retrieval from document chunks.
- Browser extension authentication and transport.
- Generic page adapter integration and Google Forms adapter.
- Automated end-to-end testing and production verification.
