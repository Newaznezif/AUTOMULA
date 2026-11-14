"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const EXTENSION_ID = "dlonmdkhokjcioepecmgkdjhkcgilfdg";

type ExtensionBridge = {
  runtime?: {
    sendMessage: (extensionId: string, message: unknown, callback: (response?: { ok?: boolean; error?: string }) => void) => void;
    lastError?: { message?: string };
  };
};

export function ExtensionConnectClient() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [failed, setFailed] = useState(false);

  async function connect() {
    setBusy(true);
    setStatus("");
    setFailed(false);

    try {
      const supabase = createClient();
      // Reuse the browser's current session. Forcing refresh here can race
      // with Next.js middleware, which also owns SSR token refresh.
      const { data: current, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(
          "Supabase could not read the browser session. Reload the dashboard and retry."
        );
      }

      let session = current.session;
      if (!session) {
        throw new Error(
          "Supabase returned no active browser session. Sign in again and retry."
        );
      }

      const expiresAt = session.expires_at ?? 0;
      if (expiresAt <= Math.floor(Date.now() / 1000) + 60) {
        const { data: refreshed, error: refreshError } =
          await supabase.auth.refreshSession();

        if (refreshError) {
          throw new Error(
            `Supabase could not refresh this browser session (${refreshError.code ?? refreshError.name}). Sign in again and retry.`
          );
        }
        if (!refreshed.session) {
          throw new Error(
            "Supabase returned no session after refreshing an expired browser session."
          );
        }
        session = refreshed.session;
      }

      const hasAccessToken =
        typeof session.access_token === "string" &&
        session.access_token.length >= 20;
      const hasRefreshToken =
        typeof session.refresh_token === "string" &&
        session.refresh_token.length >= 20;

      if (!hasAccessToken || !hasRefreshToken) {
        const missing = [
          !hasAccessToken ? "access token" : "",
          !hasRefreshToken ? "refresh token" : "",
        ].filter(Boolean).join(" and ");
        throw new Error(
          `The Supabase browser session is missing a valid ${missing}. The extension has not received any credentials. This points to the dashboard's Supabase session storage/configuration, not Chrome. Contact the AUTOMULA developer with this exact message.`
        );
      }

      const bridge = (window as Window & { chrome?: ExtensionBridge }).chrome;
      if (!bridge?.runtime?.sendMessage) {
        throw new Error(
          "Chrome extension messaging is unavailable. Enable the installed AUTOMULA extension and reload this page."
        );
      }

      await new Promise<void>((resolve, reject) => {
        bridge.runtime!.sendMessage(
          EXTENSION_ID,
          {
            type: "AUTOMULA_CONNECT",
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt:
              session.expires_at ??
              Math.floor(Date.now() / 1000) + session.expires_in,
            apiBase: window.location.origin,
          },
          (response) => {
            const runtimeError = bridge.runtime?.lastError;
            if (runtimeError) {
              reject(
                new Error(
                  "Extension not found. Reload AUTOMULA in chrome://extensions and try again."
                )
              );
            } else if (!response?.ok) {
              reject(
                new Error(response?.error || "The extension could not be connected.")
              );
            } else {
              resolve();
            }
          }
        );
      });

      setStatus(
        "AUTOMULA is connected to this Chrome browser session. You can now generate answers from the extension."
      );
    } catch (error) {
      setFailed(true);
      setStatus(
        error instanceof Error ? error.message : "Could not connect the extension."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
      <p className="text-sm leading-6 text-slate-400">
        Connect the installed Chrome extension to your signed-in AUTOMULA account.
        The extension receives a session token for this browser session only; it is
        held in Chrome session storage and is not written to disk by AUTOMULA.
      </p>
      <button
        onClick={() => void connect()}
        disabled={busy}
        className="mt-5 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400 disabled:opacity-50"
      >
        {busy ? "Connecting…" : "Connect Chrome extension"}
      </button>
      {status && (
        <p
          role={failed ? "alert" : "status"}
          className={`mt-4 text-sm leading-6 ${failed ? "text-rose-300" : "text-emerald-300"}`}
        >
          {status}
        </p>
      )}
      <p className="mt-5 text-xs leading-5 text-slate-500">
        Only connect an extension you installed from the official AUTOMULA
        repository. Disconnecting or closing the browser session removes the
        temporary extension session.
      </p>
    </section>
  );
}
