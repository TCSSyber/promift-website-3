import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Check, ImagePlus, Mail, Phone, X } from "lucide-react";

import { submitQuote } from "@/lib/quote.functions";
import { site } from "@/site-content";

type Answers = {
  name: string; phone: string; email: string; address: string;
  property: string; looking: string; sqft: string;
  budget: string; start: string; demo: string; counter: string; details: string;
};

const EMPTY: Answers = {
  name: "", phone: "", email: "", address: "",
  property: "", looking: "", sqft: "",
  budget: "", start: "", demo: "", counter: "", details: "",
};

const STEPS = ["About You", "Project", "Details", "Review"];
const OPTS = {
  property: ["Detached", "Semi-Detached", "Townhouse", "Condo", "Other"],
  looking: ["Kitchen Renovation", "Custom Millwork", "Both", "Other"],
  budget: ["Under $15K", "$15K–$25K", "$25K–$40K", "$40K–$60K", "$60K+"],
  start: ["ASAP", "1–3 Months", "3–6 Months", "6+ Months", "Not Sure"],
  demo: ["Yes", "No", "Not Sure"],
  counter: ["Quartz", "Granite", "Porcelain", "Marble", "Other", "Not Sure"],
} as const;

const MAX_FILES = 5;
const MAX_BYTES = 8 * 1024 * 1024; // Netlify Forms limit per submission

function Choice({ name, label, options, value, onPick, required }: {
  name: keyof Answers; label: string; options: readonly string[]; value: string; onPick: (k: keyof Answers, v: string) => void; required?: boolean;
}) {
  return (
    <fieldset className="qw-field qw-choice">
      <legend className="qw-label">{label}{required ? " *" : ""}</legend>
      <div className="qw-chips">
        {options.map((o) => (
          <label key={o} className="qw-chip">
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onPick(name, o)} />
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Text({ name, label, value, onChange, type = "text", required, autoComplete, placeholder, error }: {
  name: keyof Answers; label: string; value: string; onChange: (k: keyof Answers, v: string) => void;
  type?: string; required?: boolean; autoComplete?: string; placeholder?: string; error?: string;
}) {
  const id = `qw-${name}`;
  return (
    <div className="qw-field">
      <label className="qw-label" htmlFor={id}>{label}{required ? " *" : ""}</label>
      <input
        id={id} className="qw-input" type={type} name={name} value={value} required={required}
        autoComplete={autoComplete} placeholder={placeholder}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-err` : undefined}
        onChange={(e) => onChange(name, e.target.value)}
      />
      {error ? <p className="qw-err" id={`${id}-err`}>{error}</p> : null}
    </div>
  );
}

export function QuoteWizard({ source = "contact-page", compact = false }: { source?: string; compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [a, setA] = useState<Answers>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof Answers | "files", string>>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const top = useRef<HTMLDivElement>(null);

  const set = (k: keyof Answers, v: string) => {
    setA((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = (s: number) => {
    const e: typeof errors = {};
    if (s === 0) {
      if (!a.name.trim()) e.name = "Please add your name.";
      if (a.phone.replace(/\D/g, "").length < 10) e.phone = "Please add a phone number we can reach.";
      if (!/^\S+@\S+\.\S+$/.test(a.email.trim())) e.email = "Please add a valid email, like name@example.com.";
      if (!a.address.trim()) e.address = "Please add the project address or area.";
    }
    if (s === 1 && !a.looking) e.looking = "Please choose a project type.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const go = (to: number) => {
    if (to > step && !validate(step)) return;
    setDir(to > step ? 1 : -1);
    setStep(to);
    top.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []).filter((f) => f.type.startsWith("image/") || f.type === "application/pdf");
    const next = [...files, ...picked].slice(0, MAX_FILES);
    const size = next.reduce((n, f) => n + f.size, 0);
    setErrors((er) => ({ ...er, files: size > MAX_BYTES ? "Files are over 8 MB in total. Remove one or send larger files to " + site.email + "." : undefined }));
    setFiles(next);
    e.target.value = "";
  };

  const summary = (): [string, string][] => [
    ["Name", a.name], ["Phone", a.phone], ["Email", a.email], ["Address", a.address],
    ["Property", a.property], ["Project type", a.looking], ["Approx. sq ft", a.sqft],
    ["Budget", a.budget], ["Start", a.start], ["Demolition", a.demo], ["Countertop", a.counter],
    ["Details", a.details], ["Photos", files.length ? files.map((f) => f.name).join(", ") : ""],
  ];

  const onSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (step !== STEPS.length - 1 || errors.files) return;
    setStatus("sending");
    try {
      if (import.meta.env.VITE_FORM_BACKEND === "netlify") {
        const fd = new FormData();
        fd.set("form-name", "quote");
        fd.set("source", source);
        (Object.keys(a) as (keyof Answers)[]).forEach((k) => fd.set(k, a[k]));
        fd.set("project", a.looking);
        files.forEach((f, i) => fd.set(`photo${i + 1}`, f));
        const res = await fetch("/__forms.html", { method: "POST", body: fd });
        if (!res.ok) throw new Error(String(res.status));
      } else {
        const details = summary().filter(([k, v]) => v && !["Name", "Phone", "Email"].includes(k)).map(([k, v]) => `${k}: ${v}`).join("\n");
        const result = await submitQuote({ data: { name: a.name, phone: a.phone, email: a.email, project: a.looking || "Not sure", details: details.slice(0, 2000), source } });
        if (!result.ok) throw new Error("unavailable");
      }
      setStatus("done");
      top.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "done") {
    return (
      <div className="qw qw-done" ref={top} role="status">
        <span className="qw-done__mark" aria-hidden="true"><Check size={30} strokeWidth={2.2} /></span>
        <h2 className="qw-title">Thank You.<br /><em>We&rsquo;ve Received Your Project.</em></h2>
        <p className="qw-sub">We&rsquo;ll review your information and contact you shortly.</p>
        <div className="qw-done__links">
          <a href={`tel:${site.phoneTel}`}><Phone size={16} aria-hidden="true" /> {site.phoneDisplay}</a>
          <a href={`mailto:${site.email}`}><Mail size={16} aria-hidden="true" /> {site.email}</a>
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? "qw qw--compact" : "qw"} ref={top}>
      {compact ? null : <h2 className="qw-title">Tell Us About <em>Your Project.</em></h2>}
      <ol className="qw-progress" aria-label="Quote steps">
        {STEPS.map((s, i) => (
          <li key={s} data-state={i < step ? "done" : i === step ? "current" : "todo"} aria-current={i === step ? "step" : undefined}>
            <span className="qw-progress__n">{i < step ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : `0${i + 1}`}</span>
            <span className="qw-progress__label">{s}</span>
          </li>
        ))}
      </ol>
      <div className="qw-bar" aria-hidden="true"><span style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }} /></div>

      <form className="qw-form" onSubmit={onSubmit} noValidate>
        <div key={step} className="qw-step" data-dir={dir}>
          {step === 0 && (
            <div className="qw-grid">
              <Text name="name" label="Full name" value={a.name} onChange={set} required autoComplete="name" error={errors.name} />
              <Text name="phone" label="Phone" type="tel" value={a.phone} onChange={set} required autoComplete="tel" placeholder="647-555-0123" error={errors.phone} />
              <Text name="email" label="Email" type="email" value={a.email} onChange={set} required autoComplete="email" error={errors.email} />
              <Text name="address" label="Project address" value={a.address} onChange={set} required autoComplete="street-address" placeholder="Street, city" error={errors.address} />
            </div>
          )}
          {step === 1 && (
            <div className="qw-grid">
              <div className="qw-span"><Choice name="property" label="Property type" options={OPTS.property} value={a.property} onPick={set} /></div>
              <div className="qw-span">
                <Choice name="looking" label="Project type" options={OPTS.looking} value={a.looking} onPick={set} required />
                {errors.looking ? <p className="qw-err">{errors.looking}</p> : null}
              </div>
              <Text name="sqft" label="Approximate square footage" value={a.sqft} onChange={set} placeholder="e.g. 180 sq ft kitchen" />
            </div>
          )}
          {step === 2 && (
            <div className="qw-grid">
              <div className="qw-span"><Choice name="budget" label="Budget" options={OPTS.budget} value={a.budget} onPick={set} /></div>
              <div className="qw-span"><Choice name="start" label="When would you like to start?" options={OPTS.start} value={a.start} onPick={set} /></div>
              <Choice name="demo" label="Demolition required?" options={OPTS.demo} value={a.demo} onPick={set} />
              <div className="qw-span"><Choice name="counter" label="Countertop" options={OPTS.counter} value={a.counter} onPick={set} /></div>
              <div className="qw-field qw-span">
                <label className="qw-label" htmlFor="qw-details">Additional details</label>
                <textarea id="qw-details" className="qw-input qw-textarea" rows={5} value={a.details} onChange={(e) => set("details", e.target.value)} placeholder="Tell us about the space, the style you love and anything you want to change." />
              </div>
              <div className="qw-field qw-span">
                <span className="qw-label">Upload photos</span>
                <label className="qw-drop">
                  <input type="file" accept="image/*,application/pdf" multiple onChange={onFiles} />
                  <ImagePlus size={22} aria-hidden="true" />
                  <span><strong>Add photos or plans</strong> Existing space, measurements, floor plans or inspiration. Up to {MAX_FILES} files, 8 MB total.</span>
                </label>
                {files.length ? (
                  <ul className="qw-files">
                    {files.map((f, i) => (
                      <li key={f.name + i}>
                        <span>{f.name}</span>
                        <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label={`Remove ${f.name}`}><X size={14} /></button>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {errors.files ? <p className="qw-err">{errors.files}</p> : null}
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <dl className="qw-review">
                {summary().filter(([, v]) => v).map(([k, v]) => (
                  <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                ))}
              </dl>
              <p className="qw-note">Need to change something? Use Back. Nothing is sent until you press the button below.</p>
            </div>
          )}
        </div>

        {status === "error" ? (
          <p className="qw-err qw-err--block" role="alert">
            Something went wrong sending your request. Please try again, or call <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>.
          </p>
        ) : null}

        <div className="qw-nav">
          {step > 0 ? (
            <button key="back" type="button" className="qw-btn qw-btn--back" onClick={() => go(step - 1)}><ArrowLeft size={16} aria-hidden="true" /> Back</button>
          ) : <span />}
          {step < STEPS.length - 1 ? (
            <button key="next" type="button" className="qw-btn qw-btn--next" onClick={() => go(step + 1)}>Continue <ArrowRight size={16} aria-hidden="true" /></button>
          ) : (
            <button key="submit" type="submit" className="qw-btn qw-btn--next" disabled={status === "sending"}>
              {status === "sending" ? "Sending…" : <>Request my free quote <ArrowRight size={16} aria-hidden="true" /></>}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
