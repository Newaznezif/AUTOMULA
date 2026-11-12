import { test, expect } from "@playwright/test";

const baseUrl = process.env.E2E_BASE_URL;
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
const secondEmail = process.env.E2E_SECOND_EMAIL;
const secondPassword = process.env.E2E_SECOND_PASSWORD;
const authenticatedE2E = Boolean(baseUrl && email && password);

test.describe("AUTOMULA authenticated product workflows", () => {
  test.skip(!authenticatedE2E, "Set E2E_BASE_URL, E2E_EMAIL and E2E_PASSWORD to run against a dedicated E2E account.");

  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email address").fill(email!);
    await page.getByLabel("Password").fill(password!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard(?:$|\/)/);
  });

  test("knowledge records survive create, reload, update and delete", async ({ page }) => {
    const marker = `AUTOMULA-E2E-${Date.now()}`;
    let recordId = "";

    try {
      const created = await page.request.post("/api/workspace/knowledge", {
        data: {
          key: `E2E evidence ${marker}`,
          value: `The verified test value is ${marker}.`,
          category: "other",
          source_reference: "Automated Phase 5 integration test",
          verified: true
        }
      });
      expect(created.status()).toBe(201);
      const createdBody = await created.json();
      recordId = createdBody.record.id;
      expect(createdBody.record.value).toContain(marker);

      await page.reload();
      const listed = await page.request.get("/api/workspace/knowledge");
      expect(listed.ok()).toBeTruthy();
      const listedBody = await listed.json();
      expect(listedBody.records.some((item: { id: string }) => item.id === recordId)).toBeTruthy();

      const updated = await page.request.patch("/api/workspace/knowledge", {
        data: { id: recordId, value: `Updated evidence ${marker}` }
      });
      expect(updated.ok()).toBeTruthy();

      const afterUpdate = await page.request.get("/api/workspace/knowledge");
      const afterUpdateBody = await afterUpdate.json();
      expect(afterUpdateBody.records.find((item: { id: string }) => item.id === recordId)?.value).toBe(`Updated evidence ${marker}`);
    } finally {
      if (recordId) {
        await page.request.delete("/api/workspace/knowledge", { data: { id: recordId } });
      }
    }

    const afterDelete = await page.request.get("/api/workspace/knowledge");
    const afterDeleteBody = await afterDelete.json();
    expect(afterDeleteBody.records.some((item: { id: string }) => item.id === recordId)).toBeFalsy();
  });

  test("a second account cannot read or modify the first account knowledge", async ({ page, browser }) => {
    test.skip(!secondEmail || !secondPassword, "Set E2E_SECOND_EMAIL and E2E_SECOND_PASSWORD for cross-account isolation testing.");
    const marker = "AUTOMULA-ISOLATION-" + Date.now();
    const created = await page.request.post("/api/workspace/knowledge", { data: { key: marker, value: "Private value " + marker, category: "other" } });
    expect(created.status()).toBe(201);
    const recordId = (await created.json()).record.id;
    const secondContext = await browser.newContext();
    try {
      const secondPage = await secondContext.newPage();
      await secondPage.goto("/login");
      await secondPage.getByLabel("Email address").fill(secondEmail!);
      await secondPage.getByLabel("Password").fill(secondPassword!);
      await secondPage.getByRole("button", { name: "Sign in" }).click();
      await expect(secondPage).toHaveURL(/\\/dashboard(?:$|\\/)/);
      const records = await secondPage.request.get("/api/workspace/knowledge");
      expect(records.ok()).toBeTruthy();
      const body = await records.json();
      expect(body.records.some((item: { id: string }) => item.id === recordId)).toBeFalsy();
      const update = await secondPage.request.patch("/api/workspace/knowledge", { data: { id: recordId, value: "unauthorized overwrite" } });
      expect(update.status()).toBe(404);
    } finally {
      await secondContext.close();
      await page.request.delete("/api/workspace/knowledge", { data: { id: recordId } });
    }
  });
  test("document upload persists metadata and private storage object", async ({ page }) => {
    const marker = `AUTOMULA-DOCUMENT-E2E-${Date.now()}`;
    let documentId = "";

    try {
      const uploaded = await page.request.post("/api/documents", {
        multipart: {
          file: {
            name: `automula-e2e-${Date.now()}.txt`,
            mimeType: "text/plain",
            buffer: Buffer.from(`AUTOMULA Phase 5 document persistence test. ${marker}. This file contains enough text for extraction and indexing verification.`)
          }
        }
      });
      expect(uploaded.status()).toBe(201);
      const body = await uploaded.json();
      documentId = body.document.id;
      expect(["pending", "ready", "failed"]).toContain(body.document.processing_status);

      const listed = await page.request.get("/api/documents");
      expect(listed.ok()).toBeTruthy();
      const listedBody = await listed.json();
      expect(listedBody.documents.some((item: { id: string }) => item.id === documentId)).toBeTruthy();
    } finally {
      if (documentId) {
        await page.request.delete("/api/documents", { data: { id: documentId } });
      }
    }

    const afterDelete = await page.request.get("/api/documents");
    const afterDeleteBody = await afterDelete.json();
    expect(afterDeleteBody.documents.some((item: { id: string }) => item.id === documentId)).toBeFalsy();
  });

  test("AI answer cites the exact saved knowledge record used as evidence", async ({ page }) => {
    test.skip(process.env.E2E_RUN_AI !== "1", "Set E2E_RUN_AI=1 to enable the model-backed evidence test.");
    const marker = `E2E-FACT-${Date.now()}`;
    let recordId = "";

    try {
      const created = await page.request.post("/api/workspace/knowledge", {
        data: {
          key: `Unique test fact ${marker}`,
          value: `The unique verification phrase is ${marker}.`,
          category: "other",
          verified: true
        }
      });
      expect(created.status()).toBe(201);
      recordId = (await created.json()).record.id;

      const response = await page.request.post("/api/forms/analyze", {
        data: {
          title: "AUTOMULA evidence-grounding test",
          pageUrl: "https://example.com/e2e-form",
          fields: [{
            fieldId: "e2e-unique-fact",
            question: "What is the unique verification phrase recorded in my knowledge base?",
            fieldType: "text",
            required: true,
            options: [],
            hasExistingValue: false
          }, {
            fieldId: "e2e-existing-value",
            question: "What is the existing answer?",
            fieldType: "text",
            required: false,
            options: [],
            hasExistingValue: true
          }]
        }
      });
      expect(response.status()).toBe(201);
      const result = await response.json();
      const answer = result.answers.find((item: { fieldId: string }) => item.fieldId === "e2e-unique-fact");
      expect(answer).toBeTruthy();
      expect(answer.sourceIds).toContain(recordId);
      expect(answer.answer).toContain(marker);
      expect(result.sources.some((source: { id: string }) => source.id === recordId)).toBeTruthy();
      const existingAnswer = result.answers.find((item: { fieldId: string }) => item.fieldId === "e2e-existing-value");
      expect(existingAnswer?.answer).toBeNull();
      expect(existingAnswer?.confidence).toBe("unsupported");
    } finally {
      if (recordId) await page.request.delete("/api/workspace/knowledge", { data: { id: recordId } });
    }
  });

  test("extension pairing page sends a short-lived authenticated session to the browser bridge", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, "chrome", {
        configurable: true,
        value: {
          runtime: {
            lastError: undefined,
            sendMessage: (_extensionId: string, message: { type?: string; accessToken?: string; refreshToken?: string; apiBase?: string }, callback: (response: { ok: boolean }) => void) => {
              const valid = message.type === "AUTOMULA_CONNECT"
                && Boolean(message.accessToken)
                && Boolean(message.refreshToken)
                && message.apiBase === window.location.origin;
              callback({ ok: valid });
            }
          }
        }
      });
    });

    await page.goto("/dashboard/extension");
    await page.getByRole("button", { name: "Connect Chrome extension" }).click();
    await expect(page.getByRole("status")).toContainText("AUTOMULA is connected");
  });
});

test.describe("AUTOMULA authentication boundaries", () => {
  test("invalid credentials are rejected without opening the workspace", async ({ page }) => {
    test.skip(!email, "Set E2E_EMAIL to run authentication boundary checks.");
    await page.goto("/login");
    await page.getByLabel("Email address").fill(email!);
    await page.getByLabel("Password").fill("Definitely-not-the-real-password-2026!");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByRole("alert")).toContainText(/email or password is incorrect/i);
    await expect(page).toHaveURL(/\\/login/);
  });

  test("password recovery request returns a privacy-preserving confirmation", async ({ page }) => {
    test.skip(process.env.E2E_RUN_AUTH_RECOVERY !== "1" || !email, "Set E2E_RUN_AUTH_RECOVERY=1 and E2E_EMAIL to send a recovery email to the dedicated test account.");
    await page.goto("/forgot-password");
    await page.getByLabel("Email address").fill(email!);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByRole("status")).toContainText("If this account can receive email");
  });
});
