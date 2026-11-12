chrome.runtime.onInstalled.addListener(() => {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "AUTOMULA_PING") {
    sendResponse({ ok: true, product: "AUTOMULA" });
    return false;
  }
  if (message?.type === "AUTOMULA_DISCONNECT") {
    void chrome.storage.session.remove("automulaSession").then(() => sendResponse({ ok: true }));
    return true;
  }
  return false;
});

chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  const trustedOrigin = sender.origin === "https://automula.vercel.app";
  const trustedPage = sender.url?.startsWith("https://automula.vercel.app/dashboard/extension");
  if (!trustedOrigin || !trustedPage) {
    sendResponse({ ok: false, error: "Connection is only accepted from the AUTOMULA dashboard." });
    return false;
  }

  if (message?.type === "AUTOMULA_CONNECT") {
    const { accessToken, refreshToken, expiresAt } = message;
    if (typeof accessToken !== "string" || accessToken.length < 20 ||
        typeof refreshToken !== "string" || refreshToken.length < 20 ||
        typeof expiresAt !== "number") {
      sendResponse({ ok: false, error: "Invalid session information." });
      return false;
    }
    void chrome.storage.session.set({
      automulaSession: { accessToken, refreshToken, expiresAt }
    }).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false, error: "Could not store the temporary session." }));
    return true;
  }

  if (message?.type === "AUTOMULA_DISCONNECT") {
    void chrome.storage.session.remove("automulaSession").then(() => sendResponse({ ok: true }));
    return true;
  }

  return false;
});
