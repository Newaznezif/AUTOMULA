import { detectNativeFields } from "./field-types";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "AUTOMULA_DETECT_FORM") return false;

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

  return false;
});
