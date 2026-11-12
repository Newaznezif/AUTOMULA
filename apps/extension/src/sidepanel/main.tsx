import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function SidePanel() {
  const [status, setStatus] = React.useState("Ready to inspect this page");
  const [fieldCount, setFieldCount] = React.useState<number | null>(null);

  async function detectForm() {
    setStatus("Requesting page analysis…");
    setFieldCount(null);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab is available.");

      // activeTab grants temporary access after the user opens the extension.
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "AUTOMULA_DETECT_FORM"
      });

      if (!response?.ok) throw new Error("The page could not be analyzed.");
      const count = response.form.fields.length as number;
      setFieldCount(count);
      setStatus(count === 0 ? "No labeled native fields detected. Custom widgets are not supported yet." : "Page scan completed.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to inspect this page.");
    }
  }

  return (
    <main className="panel">
      <header className="brand">
        <div className="mark">A</div>
        <div><strong>AUTOMULA</strong><span>FormPilot AI</span></div>
      </header>
      <section className="intro">
        <p className="eyebrow">BROWSER ASSISTANT</p>
        <h1>Understand this form.</h1>
        <p className="muted">Detect visible native form fields on the active page. Analysis starts only when you activate it.</p>
        <button onClick={detectForm}>Detect form fields</button>
        {fieldCount !== null && <p className="count">{fieldCount} labeled field(s) detected</p>}
        <p className="status" role="status">{status}</p>
      </section>
      <footer>Foundation build: detection only. No data is sent to a server, filled, or submitted.</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><SidePanel /></React.StrictMode>);
