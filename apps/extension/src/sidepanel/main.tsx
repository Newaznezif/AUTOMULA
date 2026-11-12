import React from "react";
import { createRoot } from "react-dom/client";
import type { DetectedFormField, FillResult } from "@automula/shared";
import "./style.css";

function SidePanel() {
  const [status,setStatus] = React.useState("Ready to inspect this page");
  const [fields,setFields] = React.useState<DetectedFormField[]>([]);
  const [answers,setAnswers] = React.useState<Record<string,string>>({});
  const [approved,setApproved] = React.useState<Record<string,boolean>>({});
  const [results,setResults] = React.useState<FillResult[]>([]);
  const [busy,setBusy] = React.useState(false);

  async function activeTab() {
    const tabs = await chrome.tabs.query({active:true,currentWindow:true});
    const tab = tabs[0];
    if (!tab || !tab.id) throw new Error("No active browser tab is available.");
    return tab;
  }

  async function prepare(tabId:number) {
    await chrome.scripting.executeScript({target:{tabId},files:["content.js"]});
  }

  async function detect() {
    setBusy(true); setStatus("Inspecting visible fields…"); setResults([]);
    try {
      const tab = await activeTab(); await prepare(tab.id!);
      const response = await chrome.tabs.sendMessage(tab.id!,{type:"AUTOMULA_DETECT_FORM"});
      if (!response?.ok) throw new Error("The page could not be analyzed.");
      const detected = response.form.fields as DetectedFormField[];
      setFields(detected);
      setAnswers(Object.fromEntries(detected.map(field => [field.fieldId,""])));
      setApproved({});
      setStatus(detected.length ? "Enter responses and approve each value individually." : "No supported labeled fields were found.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to inspect this page."); }
    finally { setBusy(false); }
  }

  async function fill() {
    const values = fields.filter(field => approved[field.fieldId] && answers[field.fieldId]?.trim() && !field.hasExistingValue).map(field => ({fieldId:field.fieldId,value:answers[field.fieldId],approved:true}));
    if (!values.length) { setStatus("Approve at least one non-empty answer before filling."); return; }
    setBusy(true); setStatus("Filling approved fields and verifying…");
    try {
      const tab = await activeTab(); await prepare(tab.id!);
      const response = await chrome.tabs.sendMessage(tab.id!,{type:"AUTOMULA_FILL_APPROVED",values});
      if (!response?.ok) throw new Error("The page could not be filled.");
      const fillResults = response.results as FillResult[];
      setResults(fillResults);
      const count = fillResults.filter(result => result.status === "filled").length;
      setStatus(count + " field(s) filled and verified. Review the page and submit it yourself.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to fill approved fields."); }
    finally { setBusy(false); }
  }

  return <main className="panel">
    <header className="brand"><div className="mark">A</div><div><strong>AUTOMULA</strong><span>FormPilot AI</span></div></header>
    <section className="intro"><p className="eyebrow">BROWSER ASSISTANT</p><h1>Review. Approve. Fill.</h1><p className="muted">Detect supported fields, enter responses, and approve each value. Existing values are preserved.</p>
      <button disabled={busy} onClick={() => void detect()}>{busy ? "Please wait…" : "Detect form fields"}</button><p className="status" role="status">{status}</p>
    </section>
    {fields.length > 0 && <section className="fields"><div className="section-head"><strong>Detected fields</strong><span>{fields.length}</span></div>
      {fields.map((field,index) => <article className="field-card" key={field.fieldId}>
        <div className="field-meta"><span>FIELD {String(index+1).padStart(2,"0")}</span><span>{field.required ? "Required" : "Optional"} · {field.fieldType}</span></div>
        <p className="question">{field.question}</p>
        {field.hasExistingValue ? <p className="existing">Existing value detected · preserved</p> : <textarea rows={2} maxLength={field.maxLength} value={answers[field.fieldId] || ""} onChange={event => setAnswers(current => ({...current,[field.fieldId]:event.target.value}))} placeholder="Enter a response…" />}
        {field.options.length > 0 && <p className="hint">Available options: {field.options.map(option => option.label).join(", ")}</p>}
        <label className={"approve" + (field.hasExistingValue ? " disabled" : "")}><input type="checkbox" disabled={field.hasExistingValue || !answers[field.fieldId]?.trim()} checked={Boolean(approved[field.fieldId])} onChange={event => setApproved(current => ({...current,[field.fieldId]:event.target.checked}))}/> I approve this value for filling</label>
        {results.find(result => result.fieldId === field.fieldId) && <p className={"result " + results.find(result => result.fieldId === field.fieldId)?.status}>{results.find(result => result.fieldId === field.fieldId)?.status}: {results.find(result => result.fieldId === field.fieldId)?.message || "Value verified"}</p>}
      </article>)}
      <button className="fill-button" disabled={busy || !fields.some(field => approved[field.fieldId] && answers[field.fieldId]?.trim())} onClick={() => void fill()}>Fill approved fields only</button>
    </section>}
    <footer>Never submits forms, fills passwords, uploads files, bypasses CAPTCHA, or overwrites populated fields. AI suggestions require backend configuration.</footer>
  </main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><SidePanel /></React.StrictMode>);
