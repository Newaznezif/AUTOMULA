import Link from "next/link";
import { ArrowRight, Check, FileCheck2, Fingerprint, ShieldCheck, Sparkles } from "lucide-react";

const steps = [
  { number: "01", title: "Build your information base", description: "Add the profile details, experience, projects, and documents you want AUTOMULA to use." },
  { number: "02", title: "Get evidence-backed drafts", description: "When you open a supported form, AUTOMULA matches its questions to relevant information and shows the sources." },
  { number: "03", title: "Review, approve, then fill", description: "Edit each suggestion and approve only what is accurate. The extension fills approved fields without submitting the form." }
];

const safeguards = [
  "Your existing form values are left untouched.",
  "Unsupported or unverified answers stay blank.",
  "Passwords, payment details, and MFA codes are not stored as reusable knowledge.",
  "The final submission always remains your decision."
];

function Brand() {
  return <Link href="/" className="marketing-brand" aria-label="AUTOMULA home"><span className="marketing-brand-mark">A</span><span><strong>AUTOMULA</strong><small>FormPilot AI</small></span></Link>;
}

export default function Home() {
  return (
    <main className="marketing-page">
      <header className="marketing-header">
        <div className="marketing-header-inner">
          <Brand />
          <nav className="marketing-nav" aria-label="Main navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#your-control">Your control</a>
            <a href="https://github.com/NewazNezif/AUTOMULA" target="_blank" rel="noreferrer">GitHub</a>
          </nav>
          <div className="marketing-header-actions">
            <Link href="/login" className="marketing-signin">Sign in</Link>
            <Link href="/login?mode=signup" className="marketing-button marketing-button-primary">Create workspace <ArrowRight size={15}/></Link>
          </div>
        </div>
      </header>

      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <div className="marketing-eyebrow"><span className="marketing-eyebrow-dot"/> PERSONAL INFORMATION, USED WITH PERMISSION</div>
          <h1>Stop rewriting your story. <span>Start with what you know.</span></h1>
          <p className="marketing-hero-description">AUTOMULA organizes the information you provide, prepares evidence-grounded answers for supported online forms, and lets you decide what gets filled.</p>
          <div className="marketing-hero-actions">
            <Link href="/login?mode=signup" className="marketing-button marketing-button-primary marketing-button-large">Create your workspace <ArrowRight size={16}/></Link>
            <a href="#how-it-works" className="marketing-button marketing-button-secondary marketing-button-large">See how it works</a>
          </div>
          <div className="marketing-trust-note"><ShieldCheck size={15}/> Review every answer. Approve every field. Submit it yourself.</div>
        </div>

        <div className="product-preview" aria-label="Illustrative AUTOMULA answer review interface">
          <div className="product-preview-top">
            <div className="product-preview-window"><i/><i/><i/></div>
            <span className="product-preview-label">FORMPILOT WORKSPACE</span>
            <span className="preview-status"><span/> Review required</span>
          </div>
          <div className="product-preview-body">
            <div className="preview-form-meta"><span>APPLICATION FORM</span><span>2 QUESTIONS</span></div>
            <div className="preview-question">
              <div className="preview-question-heading"><span>QUESTION 01</span><span className="preview-confidence">Source matched</span></div>
              <h3>Describe your relevant experience.</h3>
              <div className="preview-answer">A draft prepared from the experience details you added to your knowledge base. Review the wording and confirm that it reflects your work.</div>
              <div className="preview-source"><FileCheck2 size={13}/> Experience record <span>·</span> 1 source</div>
              <div className="preview-review-actions"><span><Check size={13}/> Approved by you</span><span>Edit answer</span></div>
            </div>
            <div className="preview-question preview-question-muted">
              <div className="preview-question-heading"><span>QUESTION 02</span><span className="preview-needs-review">Needs review</span></div>
              <h3>Why are you applying?</h3>
              <div className="preview-answer preview-answer-empty">A suggestion appears here only when relevant information is available.</div>
              <div className="preview-source preview-source-muted">No answer is filled without your approval.</div>
            </div>
          </div>
          <div className="product-preview-footer"><span><Fingerprint size={14}/> Your information stays account-scoped</span><span>Illustrative preview</span></div>
        </div>
      </section>

      <section className="marketing-principles" aria-label="Product principles">
        <div><ShieldCheck size={18}/><span><strong>Private by design</strong><small>Your workspace is tied to your account.</small></span></div>
        <div><FileCheck2 size={18}/><span><strong>Evidence before answers</strong><small>Suggestions are grounded in your information.</small></span></div>
        <div><Fingerprint size={18}/><span><strong>You stay in control</strong><small>No automatic form submission.</small></span></div>
      </section>

      <section id="how-it-works" className="marketing-section">
        <div className="marketing-section-heading"><span className="marketing-section-kicker">A CLEAR WORKFLOW</span><h2>One information base. A more considered way to fill forms.</h2><p>Keep your facts organized and reuse them when you need them—without handing over the final decision.</p></div>
        <div className="marketing-steps">{steps.map(step => <article className="marketing-step" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.description}</p></article>)}</div>
      </section>

      <section id="your-control" className="marketing-control">
        <div className="marketing-control-copy"><span className="marketing-section-kicker">AUTOMATION WITH BOUNDARIES</span><h2>Useful assistance should never take control away from you.</h2><p>AUTOMULA is designed to prepare and fill—not to make decisions or submit applications on your behalf.</p><Link href="/login?mode=signup" className="marketing-inline-link">Set up your workspace <ArrowRight size={15}/></Link></div>
        <ul>{safeguards.map(item => <li key={item}><Check size={16}/><span>{item}</span></li>)}</ul>
      </section>

      <section className="marketing-cta"><div><Sparkles size={19}/><span>Make your information work harder.</span></div><Link href="/login?mode=signup" className="marketing-button marketing-button-primary">Get started <ArrowRight size={15}/></Link></section>

      <footer className="marketing-footer"><Brand/><p>Understand forms. Prepare answers. Fill with confidence.</p><span>© {new Date().getFullYear()} AUTOMULA. Built around accuracy, privacy, and user control.</span></footer>
    </main>
  );
}
