# System Architecture

## Product identity
- Brand: AUTOMULA
- Supporting product: FormPilot AI
- Interface: web dashboard + Chrome extension (Manifest V3)

## Components
1. `apps/web`: Next.js dashboard and server-side API.
2. `apps/extension`: Chrome extension, content scripts, background worker, and side panel.
3. `packages/shared`: shared TypeScript contracts and validation schemas.
4. `packages/form-engine`: DOM field extraction and normalization.
5. `packages/answer-engine`: server-side retrieval and answer orchestration.
6. `packages/browser-adapters`: generic HTML and specialized website adapters.
7. Supabase: Auth, PostgreSQL, private Storage, and pgvector.

## Trust boundaries
- The extension owns DOM locators. The AI must never return executable JavaScript or arbitrary selectors.
- The backend owns secrets, authorization, retrieval, and model calls.
- The browser sends only the minimum page information needed for the current user-initiated analysis.
- Website content and uploaded documents are untrusted input and cannot override system policy.
- Each user can access only their own profile, documents, knowledge, sessions, and suggestions.

## Form workflow
1. User explicitly activates AUTOMULA on a website.
2. Content script extracts visible, relevant form fields.
3. Extension assigns session-local field IDs and retains DOM references locally.
4. Backend analyzes normalized questions and retrieves user-authorized knowledge.
5. AI returns structured suggestions with source IDs and confidence.
6. User edits and approves selected suggestions.
7. Extension fills only approved fields and verifies resulting values.
8. Backend stores a minimal session record according to user retention settings.

## Safety constraints
- Never auto-submit forms.
- Never bypass CAPTCHA, MFA, access controls, or site restrictions.
- Never collect passwords, payment card details, or authentication codes as reusable knowledge.
- Do not silently overwrite populated fields.
- File uploads require a separate explicit user action.
- No model-generated code is executed in the extension.

## Initial implementation notes
The first phase establishes project structure and typed contracts. Supabase credentials and OpenAI credentials are intentionally not committed. Configure them locally using `.env.local` based on `.env.example`.
