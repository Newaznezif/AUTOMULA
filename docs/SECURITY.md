# Security and Privacy Baseline

## Non-negotiable controls
- User activation is required before page inspection.
- Request host access only for the current user-selected site.
- Never automatically submit an underlying form.
- Never bypass CAPTCHA, MFA, access controls, or website restrictions.
- Never store passwords, payment card data, or one-time authentication codes as reusable profile knowledge.
- Preserve existing values unless the user explicitly approves replacing them.
- File upload is a separate user action.
- Treat webpage text and uploaded documents as untrusted data.
- AI output is structured data only; never execute generated code.
- Do not place service-role keys or model API keys in browser bundles.
- Enforce ownership checks and RLS for every user-owned record.

## Data minimization
Extract only visible, relevant form questions and constraints. Avoid hidden inputs, unrelated page text, and sensitive fields. Prefer not to persist raw page content. Provide retention and deletion controls before production release.

## Release gate
Before public release, test cross-user access, token expiration, storage object policies, prompt injection, malicious form labels, stale DOM references, and unexpected page navigation.
