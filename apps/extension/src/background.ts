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
  const allowedOrigins = new Set([
    "https://automula.vercel.app",
    "https://automula-git-phase-2-core-workflows-newaznezifs-projects.vercel.app"
  ]);
  const trustedOrigin = typeof sender.origin === "string" && allowedOrigins.has(sender.origin);
  let trustedPage = false;
  try {
    const senderUrl = new URL(sender.url ?? "");
    trustedPage = allowedOrigins.has(senderUrl.origin) && senderUrl.pathname === "/dashboard/extension";
  } catch { trustedPage = false; }
  if (!trustedOrigin || !trustedPage) {
    sendResponse({ ok: false, error: "Connection is only accepted from the AUTOMULA dashboard." });
    return false;
  }

  if (message?.type === "AUTOMULA_CONNECT") {
    const { accessToken, refreshToken, expiresAt, apiBase } = message;
    if (typeof accessToken !== "string" || accessToken.length < 20 ||
        typeof refreshToken !== "string" || refreshToken.length < 20 ||
        typeof expiresAt !== "number" || apiBase !== sender.origin) {
      sendResponse({ ok: false, error: "Invalid session information." });
      return false;
    }
    void chrome.storage.session.set({
      automulaSession: { accessToken, refreshToken, expiresAt, apiBase }
    }).then(() => sendResponse({ ok: true })).catch(() => sendResponse({ ok: false, error: "Could not store the temporary session." }));
    return true;
  }

  if (message?.type === "AUTOMULA_DISCONNECT") {
    void chrome.storage.session.remove("automulaSession").then(() => sendResponse({ ok: true }));
    return true;
  }

  return false;
});
