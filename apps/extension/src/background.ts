chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "AUTOMULA_PING") {
    sendResponse({ ok: true, product: "AUTOMULA" });
    return false;
  }

  return false;
});
