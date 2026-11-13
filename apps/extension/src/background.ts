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

  let senderUrl: URL | null = null;
  try {
    senderUrl = new URL(sender.url ?? "");
  } catch {
    senderUrl = null;
  }

  // Use the validated page URL as the canonical origin. MessageSender.origin
  // is optional in Chrome and must not be the sole source of origin validation.
  const trustedOrigin = Boolean(
    senderUrl &&
    allowedOrigins.has(senderUrl.origin) &&
    (!sender.origin || sender.origin === senderUrl.origin)
  );
  const trustedPage = Boolean(
    senderUrl &&
    senderUrl.pathname === "/dashboard/extension"
  );

  if (!trustedOrigin || !trustedPage || !senderUrl) {
    sendResponse({ ok: false, error: "Connection is only accepted from the AUTOMULA dashboard." });
    return false;
  }

  if (message?.type === "AUTOMULA_CONNECT") {
    const { accessToken, refreshToken, expiresAt, apiBase } = message;

    if (typeof accessToken !== "string" || accessToken.length < 20) {
      sendResponse({ ok: false, error: "The dashboard did not provide a valid access token. Sign in again and retry." });
      return false;
    }
    if (typeof refreshToken !== "string" || refreshToken.length < 20) {
      sendResponse({ ok: false, error: "The dashboard did not provide a valid refresh token. Sign in again and retry." });
      return false;
    }
    if (typeof expiresAt !== "number" || !Number.isFinite(expiresAt)) {
      sendResponse({ ok: false, error: "The dashboard provided an invalid session expiry. Refresh your sign-in and retry." });
      return false;
    }
    if (typeof apiBase !== "string" || apiBase !== senderUrl.origin) {
      sendResponse({ ok: false, error: "The dashboard origin does not match the extension connection origin. Reload the dashboard and retry." });
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
