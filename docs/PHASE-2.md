# Phase 2 — Authenticated Web Workspace

## Delivered in this phase branch
- Supabase SSR browser/server client helpers and session refresh middleware.
- Email/password sign-up and sign-in UI.
- Authenticated workspace shell and data-backed overview.
- Profile editing.
- Owner-scoped knowledge and project CRUD APIs.
- Private document upload/list/delete API with file type and size checks.
- Applications history view.
- Settings and sign-out.
- Storage bucket, application record, and document chunk migration.

## Required external setup
1. Create or select a dedicated AUTOMULA Supabase project.
2. Apply migrations in order from `supabase/migrations`.
3. Configure Supabase Auth email confirmation and redirect URLs for the local and Vercel domains.
4. Add the Supabase project URL and publishable key to Vercel.
5. Configure a private storage bucket through the included migration.

## Known limitations
- Document text extraction and embedding jobs are not yet implemented.
- AI suggestion generation and evidence retrieval are not yet wired.
- Browser extension authentication, Google Forms adapter, and approved field filling remain later phases.
- No production build or end-to-end test has been run from this remote-only change session.
