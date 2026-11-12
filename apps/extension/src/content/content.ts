import { detectNativeFields } from "./field-types";

const documentRoot = document.documentElement;
if (documentRoot.dataset.automulaContentReady !== "true") {
  documentRoot.dataset.automulaContentReady = "true";

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "AUTOMULA_DETECT_FORM") return false;

    try {
      const fields = detectNativeFields();
      sendResponse({
        ok: true,
        form: {
          title: document.title,
          pageOrigin: window.location.origin,
          detectedAt: new Date().toISOString(),
          fields
        }
      });
    } catch {
      sendResponse({ ok: false, error: "FORM_DETECTION_FAILED" });
    }

    return false;
  });
}
