import { detectNativeFields, fillApprovedFields } from "./field-types";

const root = document.documentElement;
if (root.dataset.automulaContentReady !== "true") {
  root.dataset.automulaContentReady = "true";
  chrome.runtime.onMessage.addListener((message,_sender,sendResponse) => {
    if (message?.type === "AUTOMULA_DETECT_FORM") {
      try {
        sendResponse({ok:true,form:{title:document.title,pageOrigin:location.origin,detectedAt:new Date().toISOString(),fields:detectNativeFields()}});
      } catch { sendResponse({ok:false,error:"FORM_DETECTION_FAILED"}); }
      return false;
    }
    if (message?.type === "AUTOMULA_FILL_APPROVED") {
      try { sendResponse({ok:true,results:fillApprovedFields(Array.isArray(message.values) ? message.values : [])}); }
      catch { sendResponse({ok:false,error:"FORM_FILL_FAILED"}); }
      return false;
    }
    return false;
  });
}
