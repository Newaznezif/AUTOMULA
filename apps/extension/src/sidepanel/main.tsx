import React from "react";
import { createRoot } from "react-dom/client";
import type { DetectedFormField, FillResult } from "@automula/shared";
import "./style.css";

const API_BASE = "https://automula.vercel.app";
type StoredSession = { accessToken: string; refreshToken: string; expiresAt: number };
type Suggestion = {
  fieldId: string;
  suggestionId: string | null;
  answer: string | null;
  confidence: "high" | "medium" | "low" | "unsupported";
  sourceIds: string[];
  reasoningSummary: string;
  needsReview: boolean;
  approved?: boolean;
};
type Source = { id: string; type: string; label: string; verified: boolean };

async function readSession(): Promise<StoredSession | null> {
  const stored = await chrome.storage.session.get("automulaSession");
  return (stored.automulaSession as StoredSession | undefined) ?? null;
}

async function refreshSession(session: StoredSession): Promise<StoredSession> {
  const response = await fetch(`${API_BASE}/api/extension/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken: session.refreshToken })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Your AUTOMULA session expired. Reconnect from the dashboard.");
  const next = data as StoredSession;
  await chrome.storage.session.set({ automulaSession: next });
  return next;
}

async function apiRequest(path: string, init: RequestInit = {}) {
  let session = await readSession();
  if (!session) throw new Error("Connect this extension to your AUTOMULA account first.");
  if (session.expiresAt <= Math.floor(Date.now() / 1000) + 60) session = await refreshSession(session);

  const send = (token: string) => {
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
    return fetch(`${API_BASE}${path}`, { ...init, headers });
  };

  let response = await send(session.accessToken);
  if (response.status === 401) {
    session = await refreshSession(session);
    response = await send(session.accessToken);
  }
  return response;
}

function SidePanel() {
  const [status, setStatus] = React.useState("Ready to inspect this page");
  const [connected, setConnected] = React.useState(false);
  const [fields, setFields] = React.useState<DetectedFormField[]>([]);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [sources, setSources] = React.useState<Source[]>([]);
  const [approved, setApproved] = React.useState<Record<string, boolean>>({});
  const [results, setResults] = React.useState<FillResult[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [pageTitle, setPageTitle] = React.useState("");
  const [pageUrl, setPageUrl] = React.useState("");

  React.useEffect(() => {
    void readSession().then(session => setConnected(Boolean(session)));
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === "session" && changes.automulaSession) setConnected(Boolean(changes.automulaSession.newValue));
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  async function activeTab() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    if (!tab?.id || !tab.url) throw new Error("No active browser tab is available.");
    const url = new URL(tab.url);
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("AUTOMULA can inspect normal HTTP and HTTPS pages only.");
    return { ...tab, safeUrl: `${url.origin}${url.pathname}` };
  }

  async function prepare(tabId: number) {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
  }

  async function detect() {
    setBusy(true);
    setStatus("Inspecting visible fields…");
    setResults([]);
    setSuggestions([]);
    setSources([]);
    setApproved({});
    try {
      const tab = await activeTab();
      await prepare(tab.id!);
      const response = await chrome.tabs.sendMessage(tab.id!, { type: "AUTOMULA_DETECT_FORM" });
      if (!response?.ok) throw new Error("The page could not be analyzed.");
      const detected = response.form.fields as DetectedFormField[];
      setFields(detected);
      setAnswers(Object.fromEntries(detected.map(field => [field.fieldId, ""])));
      setPageTitle(String(response.form.title || tab.title || "Web form"));
      setPageUrl(tab.safeUrl);
      setStatus(detected.length ? "Fields detected. Generate evidence-grounded suggestions or enter your own answers." : "No supported labeled fields were found.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to inspect this page.");
    } finally {
      setBusy(false);
    }
  }

  async function generateSuggestions() {
    if (!connected) {
      setStatus("Connect your AUTOMULA account first.");
      await chrome.tabs.create({ url: `${API_BASE}/dashboard/extension` });
      return;
    }
    if (!fields.length) return;
    setBusy(true);
    setStatus("Retrieving your private evidence and generating suggestions…");
    try {
      const response = await apiRequest("/api/forms/analyze", {
        method: "POST",
        body: JSON.stringify({
          title: pageTitle,
          pageUrl,
          fields: fields.map(field => ({
            fieldId: field.fieldId,
            question: field.question,
            fieldType: field.fieldType,
            required: field.required,
            options: field.options,
            maxLength: field.maxLength,
            hasExistingValue: field.hasExistingValue
          }))
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "AI analysis failed.");
      const rows = (data.answers ?? []) as Suggestion[];
      setSuggestions(rows);
      setSources((data.sources ?? []) as Source[]);
      setAnswers(current => Object.fromEntries(rows.map(row => [row.fieldId, row.answer ?? current[row.fieldId] ?? ""])));
      setApproved({});
      setStatus("Suggestions generated. Check sources, edit as needed, and approve each field individually.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not generate suggestions.");
    } finally {
      setBusy(false);
    }
  }

  async function approveAnswer(field: DetectedFormField) {
    const row = suggestions.find(item => item.fieldId === field.fieldId);
    const value = answers[field.fieldId]?.trim() ?? "";
    if (!value || field.hasExistingValue) return;
    setBusy(true);
    setStatus("Saving your edit and recording approval…");
    try {
      if (row?.suggestionId) {
        const edit = await apiRequest(`/api/forms/answers/${row.suggestionId}`, {
          method: "PATCH",
          body: JSON.stringify({ answer: value })
        });
        const editData = await edit.json();
        if (!edit.ok) throw new Error(editData.error || "Could not save the answer.");
        const approval = await apiRequest(`/api/forms/answers/${row.suggestionId}/approve`, { method: "POST" });
        const approvalData = await approval.json();
        if (!approval.ok) throw new Error(approvalData.error || "Could not approve the answer.");
      }
      setApproved(current => ({ ...current, [field.fieldId]: true }));
      setSuggestions(current => current.map(item => item.fieldId === field.fieldId ? { ...item, approved: true } : item));
      setStatus("Answer approved. It can now be filled into the page.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not approve this answer.");
    } finally {
      setBusy(false);
    }
  }

  async function fill() {
    const values = fields
      .filter(field => approved[field.fieldId] && answers[field.fieldId]?.trim() && !field.hasExistingValue)
      .map(field => ({ fieldId: field.fieldId, value: answers[field.fieldId], approved: true }));
    if (!values.length) {
      setStatus("Approve at least one non-empty answer before filling.");
      return;
    }
    setBusy(true);
    setStatus("Filling approved fields and verifying…");
    try {
      const tab = await activeTab();
      await prepare(tab.id!);
      const response = await chrome.tabs.sendMessage(tab.id!, { type: "AUTOMULA_FILL_APPROVED", values });
      if (!response?.ok) throw new Error("The page could not be filled.");
      const fillResults = response.results as FillResult[];
      setResults(fillResults);
      const count = fillResults.filter(result => result.status === "filled").length;
      setStatus(`${count} field(s) filled and verified. Review the page and submit it yourself.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to fill approved fields.");
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    await chrome.storage.session.remove("automulaSession");
    setConnected(false);
    setSuggestions([]);
    setApproved({});
    setStatus("Extension disconnected from your AUTOMULA account.");
  }

  const sourceMap = new Map(sources.map(source => [source.id, source]));
  const confidenceClass = { high: "high", medium: "medium", low: "low", unsupported: "unsupported" };

  return (
    <main className="panel">
      <header className="brand"><div className="mark">A</div><div><strong>AUTOMULA</strong><span>FormPilot AI</span></div></header>
      <section className="intro">
        <p className="eyebrow">BROWSER ASSISTANT</p>
        <h1>Review. Approve. Fill.</h1>
        <p className="muted">Detect supported fields, generate answers from your private knowledge base, and approve each value before filling.</p>
        <div className="connection">
          <span className={connected ? "connected-dot" : "disconnected-dot"} />
          <span>{connected ? "Account connected" : "Account not connected"}</span>
          {connected ? <button className="link-button" onClick={() => void disconnect()}>Disconnect</button> : <button className="link-button" onClick={() => void chrome.tabs.create({ url: `${API_BASE}/dashboard/extension` })}>Connect account</button>}
        </div>
        <button disabled={busy} onClick={() => void detect()}>{busy ? "Please wait…" : "Detect form fields"}</button>
        <p className="status" role="status">{status}</p>
      </section>
      {fields.length > 0 && (
        <section className="fields">
          <div className="section-head"><strong>Detected fields</strong><span>{fields.length}</span></div>
          <button className="ai-button" disabled={busy || !connected} onClick={() => void generateSuggestions()}>{busy ? "Working…" : "Generate AI suggestions"}</button>
          {fields.map((field, index) => {
            const suggestion = suggestions.find(item => item.fieldId === field.fieldId);
            const sourceLabels = (suggestion?.sourceIds ?? []).map(id => sourceMap.get(id)).filter((item): item is Source => Boolean(item));
            const result = results.find(item => item.fieldId === field.fieldId);
            return (
              <article className="field-card" key={field.fieldId}>
                <div className="field-meta"><span>FIELD {String(index + 1).padStart(2, "0")}</span><span>{field.required ? "Required" : "Optional"} · {field.fieldType}</span></div>
                <p className="question">{field.question}</p>
                {field.hasExistingValue ? <p className="existing">Existing value detected · preserved</p> :
                  field.fieldType === "select" ? (
                    <select value={answers[field.fieldId] || ""} onChange={event => setAnswers(current => ({ ...current, [field.fieldId]: event.target.value }))}>
                      <option value="">Choose an available option…</option>
                      {field.options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                  ) : (
                    <textarea rows={3} maxLength={field.maxLength} value={answers[field.fieldId] || ""} onChange={event => setAnswers(current => ({ ...current, [field.fieldId]: event.target.value }))} placeholder="Review or enter a response…" />
                  )}
                {suggestion && <div className="suggestion-meta">
                  <span className={`confidence ${confidenceClass[suggestion.confidence]}`}>{suggestion.confidence} confidence</span>
                  <p>{suggestion.reasoningSummary}</p>
                  {sourceLabels.length > 0 && <div className="sources">{sourceLabels.map(source => <span key={source.id}>{source.label}{source.verified ? " · verified" : ""}</span>)}</div>}
                  {suggestion.confidence === "unsupported" && <p className="hint">No evidence-backed answer was found. Leave blank or provide your own accurate answer.</p>}
                </div>}
                {!field.hasExistingValue && <button className={approved[field.fieldId] ? "approved-button" : "approve-button"} disabled={busy || !answers[field.fieldId]?.trim() || Boolean(approved[field.fieldId])} onClick={() => void approveAnswer(field)}>{approved[field.fieldId] ? "Approved" : "Approve this answer"}</button>}
                {result && <p className={`result ${result.status}`}>{result.status}: {result.message || "Value verified"}</p>}
              </article>
            );
          })}
          <button className="fill-button" disabled={busy || !fields.some(field => approved[field.fieldId] && answers[field.fieldId]?.trim())} onClick={() => void fill()}>Fill approved fields only</button>
        </section>
      )}
      <footer>Never submits forms, fills passwords, uploads files, bypasses CAPTCHA, or overwrites populated fields. Only supported native fields are handled. You submit the form yourself.</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><SidePanel /></React.StrictMode>);
