import React from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

function SidePanel() {
  const [status, setStatus] = React.useState("Ready to inspect this page");

  async function detectForm() {
    setStatus("Requesting page analysis…");
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) throw new Error("No active tab is available.");

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "AUTOMULA_DETECT_FORM"
      });

      if (!response?.ok) throw new Error("The page could not be analyzed.");
      setStatus(`Detected ${response.form.fields.length} labeled fields on this page.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to inspect this page.");
    }
  }

  return (
    <main className="panel">
      <header className="brand">
        <div className="mark">A</div>
        <div>
          <strong>AUTOMULA</strong>
          <span>FormPilot AI</span>
        </div>
      </header>
      <section className="intro">
        <p className="eyebrow">BROWSER ASSISTANT</p>
        <h1>Understand this form.</h1>
        <p className="muted">Detect visible form fields on the active page. Analysis starts only when you activate it.</p>
        <button onClick={detectForm}>Detect form fields</button>
        <p className="status" role="status">{status}</p>
      </section>
      <footer>Nothing is filled or submitted in this foundation build.</footer>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode><SidePanel /></React.StrictMode>
);
