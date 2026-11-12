# AUTOMULA Chrome Extension

Manifest V3 browser companion for AUTOMULA / FormPilot AI.

## Current workflow

1. Build the extension from the repository root with \`pnpm --filter @automula/extension build\`.
2. In Chrome, open \`chrome://extensions\`, enable Developer mode, and choose **Load unpacked**.
3. Select \`apps/extension/dist\`.
4. Sign in to AUTOMULA at https://automula.vercel.app.
5. Open **Connect extension** in the dashboard and connect this browser session.
6. Open a normal HTTP/HTTPS form, open the AUTOMULA side panel, and detect fields.
7. Generate AI suggestions, review evidence, edit answers, and approve each field.
8. Fill approved fields. Review the page and submit it yourself.

The extension stores its short-lived access and refresh tokens in Chrome session storage. They are cleared when the browser session ends or when the user disconnects. The extension does not write them to persistent local storage.

## Supported controls

Visible, labeled text, email, telephone, number, date, textarea, and select controls. Existing values are preserved. Checkbox/radio groups, file uploads, password fields, custom widgets, cross-origin frames, CAPTCHA, and MFA are not automated.

## Security

- External account pairing accepts messages only from the AUTOMULA dashboard origin.
- AI requests use the signed-in user's Supabase access token and Row Level Security.
- Each answer must be explicitly approved before filling.
- The extension never submits forms or executes model-generated code.
- Page content is treated as untrusted input by the answer-generation service.
