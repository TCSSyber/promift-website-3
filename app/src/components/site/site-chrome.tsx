/* Promift site chrome: nav, logo, gallery, materials marquee, services,
 * closing quote block, footer, the quote form + modal, and the QR used on the
 * phone-first /quote page. All SSR-safe: no browser global is touched during
 * render (effects and handlers only). */

import { useEffect, useState, useTransition, type FormEvent } from "react";
import { ArrowRight, X } from "@phosphor-icons/react";

import { ChefHat, FileText, Hammer, House } from "lucide-react";

import { NavBar } from "@/components/ui/tubelight-navbar";
import { gallery, materials, nav, services, site } from "@/site-content";

const NAV_ICONS = [House, ChefHat, Hammer, FileText];
const NAV_SHORT = ["Home", "Kitchens", "Millwork", "Contact"];
const navItems = nav.map((item, i) => ({ name: item.label, url: item.href, icon: NAV_ICONS[i] ?? FileText, short: NAV_SHORT[i] }));
import { QuoteWizard } from "@/components/contact/quote-wizard";
import { submitQuote } from "@/lib/quote.functions";

/** SSR-safe JSON-LD (module-level stringified data, rendered inline). */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function Logo() {
  return (
    <a className="pf-logo" href="/" aria-label="Promift, home">
      <svg className="pf-logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <rect
          x="2"
          y="4"
          width="28"
          height="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <line x1="16" y1="4" x2="16" y2="28" stroke="currentColor" strokeWidth="2.4" />
        <line x1="17.2" y1="16" x2="28" y2="7" stroke="var(--pf-oak)" strokeWidth="2.4" />
        <circle cx="16" cy="16" r="2.3" fill="var(--pf-oak)" />
      </svg>
      <span className="pf-logo__word">
        Pro<em>mift</em>
      </span>
    </a>
  );
}

export function Nav({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);
  return (
    <>
      <NavBar items={navItems} className="max-xl:hidden" />
      <nav id="pf-menu" className="pf-menu" aria-label="Primary" hidden={!open}>
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <a href={item.url} onClick={() => setOpen(false)}>
                {item.name}
              </a>
            </li>
          ))}
        </ul>
        <a className="pf-menu__call" href={`tel:${site.phoneTel}`}>
          {site.phoneDisplay}
        </a>
        <a className="pf-menu__call" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </nav>
      <header className="pf-nav" data-tone={tone} data-open={open ? "true" : undefined} data-scrolled={scrolled ? "true" : undefined}>
        <div className="pf-nav__inner">
          <Logo />
          <div className="pf-nav__end">
            <button type="button" className="pf-cta-quote" data-quote-open>
              <span className="pf-cta-quote__bar" aria-hidden="true" />
              Free quote
            </button>
            <button
              type="button"
              className="pf-burger"
              aria-expanded={open}
              aria-controls="pf-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}

/** The one marquee on the site: the three materials, word for word. */
export function MaterialsMarquee() {
  const group = (hidden: boolean) => (
    <div className="pf-marquee__group" aria-hidden={hidden || undefined}>
      {materials.map((m, i) => (
        <span className="pf-marquee__item" key={`${hidden ? "b" : "a"}-${m.id}`}>
          <span className="pf-marquee__name">{m.name}</span>
          <span className="pf-marquee__note">{m.note}</span>
          {i < materials.length - 1 ? (
            <span className="pf-marquee__sep" aria-hidden="true">
              +
            </span>
          ) : null}
        </span>
      ))}
    </div>
  );

  return (
    <div className="pf-marquee" role="region" aria-label="Materials Promift builds with">
      <div className="pf-marquee__track">
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
}

const SPANS = [
  "pf-gallery__item--wide",
  "pf-gallery__item--tall",
  "pf-gallery__item--half",
  "pf-gallery__item--half",
  "pf-gallery__item--third",
  "pf-gallery__item--third",
];

/** Renders only when the client's own photos exist. */
export function Gallery() {
  if (gallery.length === 0) return null;
  return (
    <section id="work" className="pf-band">
      <div className="pf-shell">
        <div className="pf-head">
          <div>
            <h2 className="pf-h2">The kitchens we build toward</h2>
          </div>
          <p className="pf-note">Design inspiration: walnut, veined stone, bronze and warm light, built to each client&rsquo;s design.</p>
        </div>
        <div className="pf-gallery__grid">
          {gallery.map((g, i) => (
            <figure key={g.src} className={`pf-gallery__item ${SPANS[i % SPANS.length]}`}>
              <img
                src={g.src}
                alt={g.alt}
                width={g.width}
                height={g.height}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{g.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section id="services" className="pf-band">
      <div className="pf-shell">
        <div className="pf-head">
          <div>
            <h2 className="pf-h2">What Promift does</h2>
          </div>
          <p className="pf-note">
            Two services, one shop. Both are built to the client's own design.
          </p>
        </div>
        <div className="pf-services__grid">
          {services.map((s) => (
            <a className="pf-service" href={s.href} key={s.id}>
              <h3 className="pf-service__title">
                {s.title}
                <span className="pf-service__arrow" aria-hidden="true">
                  <ArrowRight size={20} weight="bold" />
                </span>
              </h3>
              <p className="pf-service__body">{s.body}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Golden-hour close: the finished kitchen behind the quote call. */
export function CloseQuote() {
  return (
    <section className="pf-close" id="quote">
      <div className="pf-close__media" aria-hidden="true">
        <img src="/assets/photos/kitchen-04.webp" alt="" width={1920} height={1080} loading="lazy" />
        <div className="pf-close__scrim" />
      </div>
      <div className="pf-close__inner">
        <h2 className="pf-close__title">The finished kitchen, at golden hour</h2>
        <p className="pf-close__body">
          Tell us about the room, the run or the millwork you have in mind. We answer by phone or
          email, in Toronto and across the GTA.
        </p>
        <div className="pf-close__actions">
          <button type="button" className="pf-cta-quote" data-quote-open>
            <span className="pf-cta-quote__bar" aria-hidden="true" />
            Free quote
          </button>
          <a className="pf-cta-call" href={`tel:${site.phoneTel}`}>
            {site.phoneDisplay}
            <span className="pf-cta-call__note">info@promift.com</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="pf-footer">
      <div className="pf-shell">
        <div className="pf-footer__grid">
          <div>
            <Logo />
            <p className="pf-footer__line" style={{ marginTop: "1rem", maxWidth: "34ch" }}>
              Kitchen renovation and custom millwork, built to each client's design.
            </p>
          </div>
          <div>
            <p className="pf-footer__label">Studio</p>
            <p className="pf-footer__line">{site.street}</p>
            <p className="pf-footer__line">
              {site.city}, {site.region}, Canada
            </p>
            <p className="pf-footer__line">Serving the {site.areaServed}</p>
          </div>
          <div>
            <p className="pf-footer__label">Reach us</p>
            <p className="pf-footer__line">
              <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>
            </p>
            <p className="pf-footer__line">
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </p>
            <p className="pf-footer__line">
              <a href="/kitchen-renovation">Kitchen renovation</a>
            </p>
            <p className="pf-footer__line">
              <a href="/custom-millwork">Custom millwork</a>
            </p>
            <p className="pf-footer__line">
              <a href="/quote">Contact &amp; free quote</a>
            </p>
          </div>
        </div>
        <div className="pf-footer__meta">
          <span>
            {site.name}, {site.city}, {site.region}
          </span>
          <span>
            {site.tagline} in the {site.areaServed}.
          </span>
        </div>
      </div>
    </footer>
  );
}

const PROJECT_OPTIONS = [
  "Kitchen renovation",
  "Custom millwork",
  "Kitchen and millwork together",
  "Not sure yet",
];

type FormStatus = "idle" | "ok" | "error";

export function QuoteForm({ source }: { source: string }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<FormStatus>("idle");
  const id = (field: string) => `${source}-${field}`;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      try {
        if (import.meta.env.VITE_FORM_BACKEND === "netlify") {
          const body = new URLSearchParams();
          body.set("form-name", "quote");
          body.set("source", source);
          for (const key of ["name", "phone", "email", "project", "details", "bot-field"]) {
            body.set(key, String(data.get(key) ?? ""));
          }
          const res = await fetch("/__forms.html", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
          });
          setStatus(res.ok ? "ok" : "error");
          return;
        }
        const result = await submitQuote({
          data: {
            name: String(data.get("name") ?? ""),
            phone: String(data.get("phone") ?? ""),
            email: String(data.get("email") ?? ""),
            project: String(data.get("project") ?? ""),
            details: String(data.get("details") ?? ""),
            source,
          },
        });
        setStatus(result.ok ? "ok" : "error");
      } catch {
        setStatus("error");
      }
    });
  };

  if (status === "ok") {
    return (
      <div className="pf-form__status" role="status">
        Thanks, your request is with us. The fastest answer is by phone:{" "}
        <a href={`tel:${site.phoneTel}`}>{site.phoneDisplay}</a>.
      </div>
    );
  }

  return (
    <form className="pf-form" name="quote" onSubmit={onSubmit} noValidate>
      <p hidden>
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>
      <div className="pf-form__row">
        <div className="pf-field">
          <label className="pf-field__label" htmlFor={id("name")}>
            Name
          </label>
          <input
            className="pf-field__input"
            id={id("name")}
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={120}
          />
        </div>
        <div className="pf-field">
          <label className="pf-field__label" htmlFor={id("phone")}>
            Phone
          </label>
          <input
            className="pf-field__input"
            id={id("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            maxLength={40}
            placeholder="416 555 0134"
          />
        </div>
      </div>
      <div className="pf-field">
        <label className="pf-field__label" htmlFor={id("email")}>
          Email
        </label>
        <input
          className="pf-field__input"
          id={id("email")}
          name="email"
          type="email"
          autoComplete="email"
          maxLength={160}
        />
      </div>
      <div className="pf-field">
        <label className="pf-field__label" htmlFor={id("project")}>
          What is it for
        </label>
        <select className="pf-field__select" id={id("project")} name="project" defaultValue={PROJECT_OPTIONS[0]}>
          {PROJECT_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      <div className="pf-field">
        <label className="pf-field__label" htmlFor={id("details")}>
          The room and the run
        </label>
        <textarea
          className="pf-field__textarea"
          id={id("details")}
          name="details"
          maxLength={2000}
          placeholder="Rough size, the street, and what you have in mind."
        />
        <span className="pf-field__hint">
          Photos help. Send them to {site.email} and we will match them to your notes.
        </span>
      </div>
      {status === "error" ? (
        <p className="pf-field__error" role="alert">
          We could not send that just now. Please call {site.phoneDisplay}.
        </p>
      ) : null}
      <button className="pf-cta-submit" type="submit" disabled={pending}>
        {pending ? "Sending" : "Start a quote"}
      </button>
    </form>
  );
}

/** One modal, opened by any [data-quote-open] trigger on the page. */
export function QuoteModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-quote-open]")) {
        event.preventDefault();
        setOpen(true);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="pf-modal" role="dialog" aria-modal="true" aria-label="Request a free quote">
      <button
        type="button"
        className="pf-modal__scrim"
        aria-label="Close the quote form"
        onClick={() => setOpen(false)}
      />
      <div className="pf-modal__panel">
        <div className="pf-modal__head">
          <h2 className="pf-modal__title">Let&rsquo;s Build <em>Your Vision.</em></h2>
          <button
            type="button"
            className="pf-modal__close"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
        <p className="pf-modal__copy">
          Tell us about your project and we&rsquo;ll get back to you with a free consultation and quote.
        </p>
        <QuoteWizard source="modal" compact />
      </div>
    </div>
  );
}

/** The QR on the /quote page, printed on cards so phones land straight here. */
export function QuoteQr() {
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const target = `${window.location.origin}/quote`;
    void import("qrcode")
      .then((QR) =>
        QR.toString(target, {
          type: "svg",
          margin: 0,
          width: 116,
          color: { dark: "#171c17", light: "#dad5ca" },
        }),
      )
      .then((markup) => {
        if (alive) setSvg(markup);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="pf-qr">
      <div
        className="pf-qr__frame"
        aria-hidden="true"
        dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
      />
      <p className="pf-qr__copy">Scan to open this quote page on your phone.</p>
    </div>
  );
}
