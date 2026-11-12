# Phase 5 — End-to-end verification

## Test environment

Use a dedicated non-production AUTOMULA account and a staging deployment connected to a Supabase test project. Never point destructive test cases at a personal account or production data.

Configure the following GitHub Actions repository settings:

- Repository variable `E2E_BASE_URL`: HTTPS URL of the staging deployment.
- Repository secret `E2E_EMAIL`: dedicated E2E account email.
- Repository secret `E2E_PASSWORD`: dedicated E2E account password.
- Optional repository secret `E2E_SECOND_EMAIL` and `E2E_SECOND_PASSWORD`: a second dedicated account for cross-user isolation tests.
- Optional repository variable `E2E_RUN_AUTH_RECOVERY=1`: send a password recovery email to the dedicated test account and verify the generic success response. Use only when the test mailbox is accessible.
- Repository variable `E2E_RUN_AI=1`: enable model-backed evidence assertions after AI Gateway is configured for staging.

Run locally from the repository root:

```bash
pnpm install
pnpm --filter @automula/web exec playwright install chromium
E2E_BASE_URL=https://<staging-host> E2E_EMAIL=<test-account> E2E_PASSWORD=<test-password> pnpm --filter @automula/web test:e2e
```

The Playwright suite covers login, invalid-credential rejection, optional password recovery initiation, knowledge create/read/update/delete persistence, optional cross-account isolation, document upload/list/delete persistence, AI source attribution against a unique saved fact (including protection of prefilled fields), and the dashboard-to-extension pairing bridge contract. Tests clean up their created records in `finally` blocks. Full recovery-link consumption and password replacement still require an accessible test mailbox and are a release acceptance check.

## Manual Chrome extension acceptance

The pairing bridge test above uses a controlled browser API stub. It does not prove Chrome Web Store installation, real extension messaging, or DOM behavior. Complete these checks in a real Chrome profile with the published extension installed:

1. Sign in to the staging dashboard and open **Extension**.
2. Connect the extension. Confirm the side panel changes to **Account connected**.
3. Reload the browser and verify the connection is session-scoped as documented.
4. Open a dedicated test form containing labeled text, textarea, and select fields; include one prefilled field.
5. Detect fields. Confirm hidden, password, file, checkbox, and radio inputs are excluded.
6. Generate suggestions. Confirm each supported answer lists a source and unsupported answers remain empty.
7. Edit an answer and approve it. Confirm editing again invalidates the prior approval.
8. Fill approved values. Confirm only approved empty fields change, select values must match an available option, and each result is verified.
9. Confirm the prefilled field is unchanged and the extension never submits the form.
10. Disconnect. Confirm subsequent API calls require reconnection.

## Release gates

- Auth: successful login and session restoration; invalid credentials rejected; confirmation and recovery links are single-use; reset changes the password.
- Knowledge: create/read/update/delete survives reload; one account cannot read or mutate another account's records.
- Documents: private object and metadata are created together; extraction/indexing state is visible; deletion removes storage object, metadata, and cascading chunks.
- AI: returned source IDs exist in the caller's evidence set; unsupported answers have no answer; unverified evidence cannot produce high confidence; existing form values are never suggested for overwrite.
- Extension: pairing, refresh, approval invalidation, field-level verification, existing-value preservation, and no-submit behavior pass on real Chrome.
- CI: web and extension typecheck/build plus configured Playwright suite pass.

## Current test limitations

Password recovery requires an accessible test mailbox; the workflow deliberately does not trigger password-reset email for a personal account. Configure Supabase Auth redirect URLs for the staging origin and test recovery through a dedicated mailbox. Real Chrome extension DOM testing remains a manual release gate until a stable unpacked-extension browser harness is added.
