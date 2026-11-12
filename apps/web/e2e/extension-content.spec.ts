import { test, expect } from "@playwright/test";
import { resolve } from "node:path";

const compiledContentScript = resolve(process.cwd(), "../extension/dist/content.js");
type RuntimeMessageListener = (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => void;
type FixtureWindow = Window & { __automulaMessage?: RuntimeMessageListener };

test("compiled extension content script detects fields and fills only approved empty values", async ({ page }) => {
  await page.setContent(`
    <!doctype html>
    <html><head><title>AUTOMULA extension fixture</title></head><body>
      <form>
        <label for="full-name">Full name</label>
        <input id="full-name" name="full_name" type="text">
        <label for="email">Email address</label>
        <input id="email" name="email" type="email" value="existing@example.com">
        <label for="country">Country</label>
        <select id="country" name="country">
          <option value="">Choose</option>
          <option value="ET">Ethiopia</option>
          <option value="KE">Kenya</option>
        </select>
        <label for="city">City</label>
        <input id="city" name="city" type="text">
        <input type="password" aria-label="Password">
        <input type="hidden" name="secret" value="hidden">
      </form>
    </body></html>
  `);

  await page.evaluate(() => {
    Object.defineProperty(window, "chrome", {
      configurable: true,
      value: {
        runtime: {
          onMessage: {
            addListener(listener: RuntimeMessageListener) {
              (window as FixtureWindow).__automulaMessage = listener;
            }
          }
        }
      }
    });
  });
  await page.addScriptTag({ path: compiledContentScript });

  const detected = await page.evaluate(() => {
    const listener = (window as FixtureWindow).__automulaMessage;
    if (!listener) throw new Error("Content script did not register its runtime message listener.");
    let response: unknown;
    listener({ type: "AUTOMULA_DETECT_FORM" }, {}, value => { response = value; });
    return response as { ok: boolean; form: { fields: Array<{ fieldId: string; question: string; hasExistingValue: boolean; fieldType: string }> } };
  });

  expect(detected.ok).toBe(true);
  expect(detected.form.fields.map(field => field.question)).toEqual(["Full name", "Email address", "Country", "City"]);
  expect(detected.form.fields[1].hasExistingValue).toBe(true);
  expect(detected.form.fields[2].fieldType).toBe("select");

  const fillResponse = await page.evaluate(() => {
    const listener = (window as FixtureWindow).__automulaMessage!;
    let response: unknown;
    listener({
      type: "AUTOMULA_FILL_APPROVED",
      values: [
        { fieldId: "automula-field-1", value: "Ada Lovelace", approved: true },
        { fieldId: "automula-field-2", value: "overwrite@example.com", approved: true },
        { fieldId: "automula-field-3", value: "ET", approved: true },
        { fieldId: "automula-field-4", value: "Addis Ababa", approved: false }
      ]
    }, {}, value => { response = value; });
    return response as { ok: boolean; results: Array<{ fieldId: string; status: string }> };
  });

  expect(fillResponse.ok).toBe(true);
  expect(fillResponse.results.map(result => result.status)).toEqual(["filled", "skipped", "filled", "skipped"]);
  await expect(page.locator("#full-name")).toHaveValue("Ada Lovelace");
  await expect(page.locator("#email")).toHaveValue("existing@example.com");
  await expect(page.locator("#country")).toHaveValue("ET");
  await expect(page.locator("#city")).toHaveValue("");
});
