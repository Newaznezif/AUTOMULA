# AUTOMULA

**Product:** AUTOMULA  
**Assistant:** FormPilot AI  
**Tagline:** Understand forms. Prepare answers. Fill with confidence.

AUTOMULA is a personal information workspace and browser form assistant. It stores facts and documents supplied by each user, prepares evidence-grounded answer suggestions, and helps fill supported browser forms only after explicit approval.

## What is implemented

### Web workspace
- Next.js App Router application with a public landing page and authenticated workspace shell.
- Supabase Auth session handling and account callback.
- Profile, knowledge record, project, and application-history screens.
- Private document upload endpoints for PDF, DOCX, and TXT.
- Text extraction, chunking, and vector indexing for supported documents.
- AI Form Studio API that combines profile, structured knowledge, project, and relevant document evidence.
- Source IDs, confidence labels, field constraints, and review-required suggestions.
- User-scoped database access through Supabase RLS.

### Chrome extension
- Manifest V3 extension with a side panel.
- User-initiated detection of visible, labeled native HTML form fields.
- Per-field answer editing and explicit approval.
- Fill only approved, empty text/email/telephone/number/date/textarea/select fields.
- Existing values, password fields, file uploads, disabled fields, and choice controls are not overwritten or automatically handled.
- Field change events and post-fill value verification.
- No automatic submission.

## Important integration status

The repository is build-validated in GitHub Actions. The web and extension builds pass on the latest checked CI run.

The live account and AI workflows require a dedicated Supabase project and its configuration. Do not reuse another application's database. AI generation requires Vercel AI Gateway authentication. The extension currently supports manual answer entry and safe filling; extension-to-account authentication and automatic AI suggestion handoff remain integration work.

AUTOMULA does not claim universal support for every website. Custom JavaScript widgets, cross-origin frames, CAPTCHA, MFA, and website-specific controls can require manual interaction.

## Stack

- Next.js 15, React 19, TypeScript, Tailwind CSS
- Chrome Manifest V3, Vite, React
- Supabase Auth, PostgreSQL, Storage, Row Level Security, pgvector
- Vercel AI SDK and AI Gateway
- pnpm workspace

## Local setup (Windows PowerShell)

Requirements: Git, Node.js 22, pnpm 10, and Chrome.

Clone the implementation branch:

```powershell
git clone --branch phase-1-foundation https://github.com/NewazNezif/AUTOMULA.git "C:\Users\It's Blue\AUTOMULA"
Set-Location "C:\Users\It's Blue\AUTOMULA"
```

Install dependencies:

```powershell
corepack enable
pnpm install
```

Create the web environment file:

```powershell
Copy-Item .env.example apps/web/.env.local
```

Set these values in `apps/web/.env.local` after the dedicated Supabase project is created:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `AI_GATEWAY_API_KEY` (for local AI requests)

Never commit `.env.local`, service-role keys, or provider secrets.

Apply every SQL migration in `supabase/migrations` to the dedicated AUTOMULA database in filename order. Confirm the private `private-documents` bucket and RLS policies exist before uploading real documents.

Run the web app:

```powershell
pnpm --filter @automula/web dev
```

Build the Chrome extension:

```powershell
pnpm --filter @automula/extension build
```

Then open `chrome://extensions`, enable Developer mode, choose **Load unpacked**, and select:

```text
C:\Users\It's Blue\AUTOMULA\apps\extension\dist
```

Run all repository checks:

```powershell
pnpm --filter @automula/web typecheck
pnpm --filter @automula/web build
pnpm --filter @automula/extension typecheck
pnpm --filter @automula/extension build
```

## Security rules

- User data is private and user-scoped.
- The model receives only the authenticated user's selected workspace evidence.
- Uploaded files are private; no public document URLs are generated.
- Web page text and document contents are treated as untrusted evidence, not instructions.
- Unsupported answers remain blank rather than fabricated.
- The user reviews and approves every value before filling.
- Existing form values are preserved.
- AUTOMULA never submits forms, bypasses CAPTCHA/MFA, or stores passwords, payment-card details, or MFA codes as reusable knowledge.

## Development branch

Active implementation branch: `phase-1-foundation`  
Main branch: preserved; not replaced by this implementation.
