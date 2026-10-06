import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Gem, Hammer, MapPin, PencilRuler, Phone, X } from "lucide-react";

import { useMillworkMotion } from "@/components/millwork/millwork-page";
import { site } from "@/site-content";

const K = "/assets/kitchen";
const css = (v: Record<string, string>) => v as React.CSSProperties;

const TRUST = [
  { icon: PencilRuler, title: "Custom design", body: "Built around your space" },
  { icon: Gem, title: "Quality materials", body: "MDF • Melamine • Solid Wood" },
  { icon: MapPin, title: "Toronto & GTA", body: "Local design & installation" },
  { icon: Hammer, title: "Built to last", body: "Craftsmanship that matters" },
];

const SERVICES = [
  { title: "Custom Cabinetry", body: "Designed around your space, storage needs and style.", src: `${K}/cabinetry.webp`, alt: "Floor-to-ceiling walnut and green cabinetry with a pull-out pantry" },
  { title: "Kitchen Islands", body: "Functional islands designed to become the centre of your home.", src: `${K}/island.webp`, alt: "Walnut island with a thick waterfall stone top and linen stools" },
  { title: "Countertops & Finishes", body: "Premium surfaces, hardware and finishes selected to work together.", src: `${K}/countertops.webp`, alt: "Veined stone counter and backsplash with walnut cabinets and finish samples" },
  { title: "Installation", body: "Professional installation with attention to every detail.", src: `${K}/installation.webp`, alt: "Installer levelling a walnut upper cabinet" },
];

const GALLERY = [
  { src: `${K}/cream.webp`, alt: "Bright cream shaker kitchen with a long stone island and brass pendants", label: "Cream & oak", w: 1344, h: 752, span: "wide" },
  { src: `${K}/dark.webp`, alt: "Moody charcoal kitchen with dark green marble and a walnut island", label: "Dark cabinetry", w: 880, h: 1168, span: "tall" },
  { src: "/assets/photos/kitchen-02.webp", alt: "Open-plan walnut kitchen with a long stone island and tall windows", label: "Large island", w: 1920, h: 1080, span: "wide" },
  { src: `${K}/pantry.webp`, alt: "Walk-in pantry with walnut shelving and a coffee station", label: "Custom storage", w: 880, h: 1168, span: "tall" },
];

const STEPS = [
  { n: "01", title: "Consultation", body: "We learn about your space, style and goals." },
  { n: "02", title: "Design", body: "We develop the layout, cabinetry and material selections." },
  { n: "03", title: "Build", body: "Your cabinetry and components are precisely fabricated." },
  { n: "04", title: "Install", body: "Our team brings everything together with a professional installation." },
];

function QuoteButton({ label = "Free quote", variant = "solid" }: { label?: string; variant?: "solid" | "ghost" | "ghost-light" }) {
  return (
    <button type="button" className={`mw-btn mw-btn--${variant}`} data-quote-open>
      {label} <ArrowRight aria-hidden="true" size={16} strokeWidth={2.2} />
    </button>
  );
}

function CallLink() {
  return (
    <a className="mw-call" href={`tel:${site.phoneTel}`}>
      <Phone aria-hidden="true" size={16} strokeWidth={2.2} /> {site.phoneDisplay}
    </a>
  );
}

function Gallery() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const open = (i: number) => {
    setIndex(i);
    dialog.current?.showModal();
  };
  const step = useCallback((d: number) => setIndex((i) => (i + d + GALLERY.length) % GALLERY.length), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.current?.open) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);
  const item = GALLERY[index];
  return (
    <>
      <ul className="kr-masonry">
        {GALLERY.map((g, i) => (
          <li key={g.src} className={`kr-masonry__item kr-masonry__item--${g.span}`} data-reveal-clip>
            <button type="button" className="kr-masonry__btn" onClick={() => open(i)} aria-label={`View larger: ${g.label}`}>
              <img src={g.src} alt={g.alt} loading="lazy" width={g.w} height={g.h} />
              <span className="kr-masonry__label">{g.label}</span>
            </button>
          </li>
        ))}
      </ul>
      <dialog ref={dialog} className="kr-lightbox" aria-label="Kitchen gallery" onClick={(e) => e.target === dialog.current && dialog.current?.close()}>
        <img src={item.src} alt={item.alt} />
        <p className="kr-lightbox__cap">
          {item.label} <span>{index + 1} / {GALLERY.length}</span>
        </p>
        <button type="button" className="kr-lightbox__btn kr-lightbox__close" onClick={() => dialog.current?.close()} aria-label="Close gallery"><X size={20} /></button>
        <button type="button" className="kr-lightbox__btn kr-lightbox__prev" onClick={() => step(-1)} aria-label="Previous image"><ChevronLeft size={22} /></button>
        <button type="button" className="kr-lightbox__btn kr-lightbox__next" onClick={() => step(1)} aria-label="Next image"><ChevronRight size={22} /></button>
      </dialog>
    </>
  );
}

export function KitchenPage() {
  const root = useRef<HTMLDivElement>(null);
  useMillworkMotion(root);

  return (
    <div className="mw kr" ref={root}>
      <section className="mw-hero" aria-labelledby="kr-hero-title">
        <img className="mw-hero__img" src={`${K}/hero.webp`} alt="" width={1344} height={752} fetchPriority="high" />
        <div className="mw-hero__shade" aria-hidden="true" />
        <div className="mw-shell mw-hero__inner">
          <p className="mw-eyebrow mw-load" style={css({ "--d": "0.15s" })}>Toronto &amp; the GTA</p>
          <h1 id="kr-hero-title" className="mw-hero__title kr-hero__title mw-load" style={css({ "--d": "0.25s" })}>
            Toronto Kitchen Renovations, <em>Built Around You.</em>
          </h1>
          <p className="mw-hero__copy mw-load" style={css({ "--d": "0.4s" })}>
            We design and build complete kitchen renovations across Toronto and the GTA — from custom
            cabinetry and islands to countertops, finishes and final installation.
          </p>
          <div className="mw-actions">
            <span className="mw-load" style={css({ "--d": "0.55s" })}><QuoteButton /></span>
            <span className="mw-load" style={css({ "--d": "0.65s" })}><CallLink /></span>
          </div>
          <p className="kr-trustline mw-load" style={css({ "--d": "0.75s" })}>Design • Build • Install</p>
          <ul className="mw-trust" aria-label="Why Promift">
            {TRUST.map((t, i) => (
              <li key={t.title} className="mw-trust__item mw-load" style={css({ "--d": `${0.85 + i * 0.1}s` })}>
                <t.icon className="kr-trust__icon" aria-hidden="true" size={18} strokeWidth={1.6} />
                <span>
                  <strong>{t.title}</strong>
                  <span>{t.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mw-sec mw-sec--ivory" aria-labelledby="kr-diff">
        <div className="mw-shell kr-diff">
          <div className="kr-diff__text" data-reveal>
            <p className="mw-eyebrow mw-eyebrow--dark">The Promift difference</p>
            <h2 id="kr-diff" className="mw-h2">A Kitchen Designed <em>Around Your Life.</em></h2>
            <p className="mw-copy">
              Your kitchen should work beautifully, look incredible and feel like it belongs in your home.
              We bring the entire renovation together — from layout and cabinetry to countertops, finishes
              and installation.
            </p>
            <p className="mw-aside">One team. One plan. One kitchen that fits.</p>
            <QuoteButton label="Get a free quote" variant="ghost" />
          </div>
          <div className="kr-collage">
            <div className="kr-collage__main" data-reveal-clip>
              <img src="/assets/photos/kitchen-01.webp" alt="Walnut and stone kitchen with a waterfall island and pendant lights" loading="lazy" width={1920} height={1080} />
            </div>
            <div className="kr-collage__a" data-reveal style={css({ "--d": "0.15s" })}>
              <img src={`${K}/cabinet-detail.webp`} alt="Green shaker door with a brass pull and an open dovetailed walnut drawer" loading="lazy" width={880} height={1168} />
            </div>
            <div className="kr-collage__b" data-reveal style={css({ "--d": "0.3s" })}>
              <img src={`${K}/island.webp`} alt="Walnut island with a waterfall stone top" loading="lazy" width={880} height={1168} />
            </div>
            <div className="kr-collage__c" data-reveal style={css({ "--d": "0.45s" })}>
              <img src={`${K}/hardware.webp`} alt="Brass faucet and knob against veined stone" loading="lazy" width={1024} height={1024} />
            </div>
          </div>
        </div>
      </section>

      <section className="mw-sec mw-sec--beige" aria-labelledby="kr-all">
        <div className="mw-shell">
          <div className="kr-head" data-reveal>
            <h2 id="kr-all" className="mw-h2">Everything You Need. <em>One Team.</em></h2>
            <p className="mw-copy">No juggling trades. No guesswork. One team that owns your kitchen from the first sketch to the last hinge.</p>
          </div>
          <ul className="kr-cards">
            {SERVICES.map((s, i) => (
              <li key={s.title} data-reveal style={css({ "--d": `${i * 0.08}s` })}>
                <button type="button" className="mw-card kr-card" data-quote-open aria-label={`${s.title} — get a free quote`}>
                  <span className="mw-card__media"><img src={s.src} alt={s.alt} loading="lazy" width={880} height={1168} /></span>
                  <span className="mw-card__label"><strong>{s.title}</strong><span>{s.body}</span></span>
                  <ArrowRight className="mw-card__arrow" aria-hidden="true" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mw-sec mw-sec--ivory" id="gallery" aria-labelledby="kr-gal">
        <div className="mw-shell">
          <div className="kr-head kr-head--split" data-reveal>
            <h2 id="kr-gal" className="mw-h2">Built for the Way <em>You Live.</em></h2>
            <p className="mw-copy">Warm wood or bright cream. Bold and dark or quietly modern. Tap any kitchen to look closer.</p>
          </div>
          <Gallery />
        </div>
      </section>

      <section className="mw-sec kr-process" id="process" aria-labelledby="kr-proc">
        <div className="mw-shell">
          <div className="kr-head" data-reveal>
            <p className="mw-eyebrow">Our process</p>
            <h2 id="kr-proc" className="mw-h2 mw-h2--light">From First Idea <em>to Finished Kitchen.</em></h2>
          </div>
          <ol className="kr-timeline">
            {STEPS.map((s, i) => (
              <li key={s.n} className="kr-timeline__step" data-reveal style={css({ "--d": `${i * 0.14}s` })}>
                <span className="kr-timeline__dot" aria-hidden="true" />
                <span className="kr-timeline__n">{s.n}</span>
                <strong>{s.title}</strong>
                <span>{s.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mw-final" id="quote" aria-labelledby="kr-final">
        <img className="mw-final__img" src="/assets/photos/kitchen-04.webp" alt="" loading="lazy" width={1920} height={1080} />
        <div className="mw-final__shade" aria-hidden="true" />
        <div className="mw-shell mw-final__inner" data-reveal>
          <p className="mw-eyebrow">Let&rsquo;s talk</p>
          <h2 id="kr-final" className="mw-h2 mw-h2--light mw-final__title">Ready to Build <em>Your Kitchen?</em></h2>
          <p className="mw-copy mw-copy--light">
            Tell us about your space, your ideas and what you have in mind. We&rsquo;ll help you turn it into
            a kitchen built around the way you live.
          </p>
          <div className="mw-actions">
            <QuoteButton label="Get a free quote" />
            <CallLink />
          </div>
          <ul className="mw-final__trust">
            <li><strong>Toronto &amp; GTA</strong><span>Local team</span></li>
            <li><strong>Free consultation</strong><span>Talk it through first</span></li>
            <li><strong>No obligation</strong><span>Just a clear plan</span></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
