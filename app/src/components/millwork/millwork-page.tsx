import { useEffect, useRef } from "react";
import { ArrowRight, Phone } from "lucide-react";

import { site } from "@/site-content";

const IMG = "/assets/millwork";
const css = (v: Record<string, string>) => v as React.CSSProperties;

const BUILDS = [
  { title: "TV & Media Walls", body: "Built-in media walls designed around your room, screen and storage needs.", src: `${IMG}/tv-wall.webp`, alt: "Green lacquered media wall with walnut slats and a floating console" },
  { title: "Fireplace Surrounds", body: "Custom surrounds and mantels designed to become the focal point of the room.", src: `${IMG}/fireplace.webp`, alt: "Stone fireplace surround framed by built-in walnut cabinetry" },
  { title: "Walk-In Closets", body: "Purpose-built storage designed around your space and wardrobe.", src: `${IMG}/closet.webp`, alt: "Walnut walk-in closet with glass doors and a stone-topped island" },
  { title: "Built-Ins & Storage", body: "Custom cabinetry that makes awkward spaces useful.", src: `${IMG}/built-ins.webp`, alt: "Deep green built-in library shelving with a window seat" },
  { title: "Bathroom Vanities", body: "Precision-built vanities designed around your bathroom.", src: `${IMG}/vanity.webp`, alt: "Floating fluted walnut vanity with a stone top and brass faucet" },
];

const STEPS = [
  { n: "01", title: "Raw material", body: "MDF, melamine and solid wood, selected for each part.", src: `${IMG}/raw.webp`, alt: "Stacks of raw MDF and veneered plywood sheets in the shop" },
  { n: "02", title: "CNC cut", body: "Every component cut to the millimetre from your drawings.", src: `${IMG}/cnc.webp`, alt: "CNC router bit cutting a groove into an MDF panel" },
  { n: "03", title: "Assembly", body: "Boxes, doors and drawers built and checked by hand.", src: `${IMG}/assembly.webp`, alt: "Hands clamping a walnut cabinet box on a workbench" },
  { n: "04", title: "Installation", body: "Scribed, levelled and fitted to your walls on site.", src: `${IMG}/install.webp`, alt: "Installer fitting a floor-to-ceiling walnut built-in wall unit" },
];

const MATERIALS = [
  { title: "MDF", body: "Precise, versatile and ideal for painted custom cabinetry.", src: `${IMG}/mdf.webp`, alt: "Close-up of a painted green MDF shaker door edge" },
  { title: "Melamine", body: "Durable, practical and available in a wide range of finishes.", src: `${IMG}/melamine.webp`, alt: "Close-up of oak-grain melamine panels with matching edge banding" },
  { title: "Solid Wood", body: "Natural, timeless and used where the material itself is part of the design.", src: `${IMG}/solid-wood.webp`, alt: "Close-up of oiled solid walnut with a dovetail joint" },
];

function QuoteButton({ label = "Get a free quote", variant = "solid" }: { label?: string; variant?: "solid" | "ghost" | "ghost-light" }) {
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

/** Reveal-on-scroll + gentle hero parallax. Client-only, motion-safe. */
export function useMillworkMotion(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.dataset.ready = "true";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = el.querySelectorAll<HTMLElement>("[data-reveal]");
    if (reduce || !("IntersectionObserver" in window)) {
      targets.forEach((t) => (t.dataset.in = "true"));
      el.querySelectorAll<HTMLElement>("[data-reveal-clip]").forEach((c) => (c.dataset.in = "true"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "true";
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    // Clip-path reveals are invisible to IntersectionObserver while clipped,
    // so they are triggered by their section instead.
    const clips = el.querySelectorAll<HTMLElement>("[data-reveal-clip]");
    const clipIo = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.querySelectorAll<HTMLElement>("[data-reveal-clip]").forEach((c) => (c.dataset.in = "true"));
            clipIo.unobserve(e.target);
          }
        }
      },
      { threshold: 0.2 },
    );
    clips.forEach((c) => {
      const section = c.closest("section");
      if (section) clipIo.observe(section);
      else c.dataset.in = "true";
    });
    targets.forEach((t) => {
      // anything already on or above the screen shows immediately
      if (t.getBoundingClientRect().top < window.innerHeight) t.dataset.in = "true";
      else io.observe(t);
    });

    const hero = el.querySelector<HTMLElement>(".mw-hero__img");
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, window.innerHeight);
        if (hero) hero.style.setProperty("--mw-parallax", `${y * 0.18}px`);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      clipIo.disconnect();
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [root]);
}

/** Slow horizontal drift for [data-drift] images as they cross the viewport. */
function useDrift(root: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-drift]"));
    let raf = 0;
    const tick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        for (const it of items) {
          const r = it.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) continue;
          const p = (vh - r.top) / (vh + r.height); // 0..1
          it.style.setProperty("--drift", `${(p - 0.5) * -6}%`);
        }
      });
    };
    tick();
    window.addEventListener("scroll", tick, { passive: true });
    return () => {
      window.removeEventListener("scroll", tick);
      cancelAnimationFrame(raf);
    };
  }, [root]);
}

export function MillworkPage() {
  const root = useRef<HTMLDivElement>(null);
  useMillworkMotion(root);
  useDrift(root);

  return (
    <div className="mw mf" ref={root}>
      {/* ---------- HERO: the shop ---------- */}
      <section className="mf-hero" aria-labelledby="mf-hero-title">
        <div className="mf-hero__text">
          <p className="mw-eyebrow mw-load" style={css({ "--d": "0.15s" })}>Toronto custom millwork</p>
          <h1 id="mf-hero-title" className="mw-hero__title mf-hero__title mw-load" style={css({ "--d": "0.25s" })}>
            Custom Millwork, <em>Built From the First Cut.</em>
          </h1>
          <p className="mw-hero__copy mw-load" style={css({ "--d": "0.4s" })}>
            From CNC-cut components to finished installation, PROMIFT builds custom millwork around
            your space, your design and the way you live.
          </p>
          <div className="mw-actions">
            <span className="mw-load" style={css({ "--d": "0.55s" })}><QuoteButton /></span>
            <span className="mw-load" style={css({ "--d": "0.65s" })}><CallLink /></span>
          </div>
          <p className="mf-tagline mw-load" style={css({ "--d": "0.8s" })}>
            Designed for your space. Cut in our shop. Finished in your home.
          </p>
        </div>
        <div className="mf-hero__media">
          <img className="mw-hero__img mf-hero__img" src={`${IMG}/shop.webp`} alt="CNC router cutting a cabinet panel in the Promift workshop" width={880} height={1168} fetchPriority="high" />
          <span className="mf-hero__badge mw-load" style={css({ "--d": "1s" })}>In our shop · CNC cutting</span>
        </div>
      </section>

      {/* ---------- WHAT WE BUILD ---------- */}
      <section className="mw-sec mw-sec--ivory" aria-labelledby="mf-build">
        <div className="mw-shell">
          <div className="mf-head" data-reveal>
            <h2 id="mf-build" className="mw-h2">What We <em>Build.</em></h2>
            <p className="mw-copy">Your design. Our shop. Built precisely.</p>
          </div>
          <ul className="mf-builds">
            {BUILDS.map((b, i) => (
              <li key={b.title} data-reveal style={css({ "--d": `${i * 0.08}s` })}>
                <button type="button" className="mw-card mf-card" data-quote-open aria-label={`${b.title} — get a free quote`}>
                  <span className="mw-card__media"><img src={b.src} alt={b.alt} loading="lazy" width={880} height={1168} /></span>
                  <span className="mw-card__label"><strong>{b.title}</strong><span>{b.body}</span></span>
                  <ArrowRight className="mw-card__arrow" aria-hidden="true" size={18} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- FABRICATION ---------- */}
      <section className="mf-fab" aria-labelledby="mf-fab">
        <div className="mw-shell">
          <div className="mf-head mf-head--split" data-reveal>
            <div>
              <p className="mw-eyebrow">How it&rsquo;s made</p>
              <h2 id="mf-fab" className="mw-h2 mw-h2--light">From Raw Material <em>to Finished Millwork.</em></h2>
            </div>
            <div>
              <p className="mw-copy mw-copy--light"><strong className="mf-lead">Every project starts with precision.</strong></p>
              <p className="mw-copy mw-copy--light">
                We cut, build and finish each component with attention to the details that make custom
                millwork feel built-in rather than simply installed.
              </p>
            </div>
          </div>
          <ol className="mf-steps" data-reveal-clip>
            {STEPS.map((s, i) => (
              <li key={s.n} className="mf-step" style={css({ "--i": String(i) })}>
                <span className="mf-step__media"><img src={s.src} alt={s.alt} loading="lazy" width={880} height={1168} /></span>
                <span className="mf-step__n">{s.n}</span>
                <strong>{s.title}</strong>
                <span>{s.body}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- FINISHED ---------- */}
      <section className="mf-done" aria-labelledby="mf-done">
        <div className="mf-done__media" data-reveal-clip>
          <img data-drift src={`${IMG}/media-fireplace.webp`} alt="Finished walnut media wall with a linear fireplace in veined stone and lit shelving" loading="lazy" width={880} height={1168} />
        </div>
        <div className="mf-done__text" data-reveal>
          <p className="mw-eyebrow mw-eyebrow--dark">The result</p>
          <h2 id="mf-done" className="mw-h2">Made in the Shop. <em>Finished in Your Home.</em></h2>
          <p className="mw-copy">
            The final result is more than cabinetry. It is millwork designed specifically for the
            proportions, architecture and needs of your home.
          </p>
          <ul className="mf-mats" aria-label="Materials we build with">
            {MATERIALS.map((m) => (
              <li key={m.title} className="mf-mat">
                <img src={m.src} alt={m.alt} loading="lazy" width={1024} height={1024} />
                <span><strong>{m.title}</strong>{m.body}</span>
              </li>
            ))}
          </ul>
          <QuoteButton label="Start your project" variant="ghost" />
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="mw-final" id="quote" aria-labelledby="mf-final">
        <img className="mw-final__img" data-drift src={`${IMG}/hero.webp`} alt="" loading="lazy" width={1344} height={752} />
        <div className="mw-final__shade" aria-hidden="true" />
        <div className="mw-shell mw-final__inner" data-reveal>
          <p className="mw-eyebrow">Ready when you are</p>
          <h2 id="mf-final" className="mw-h2 mw-h2--light mw-final__title">Have a Space <em>We Can Build For?</em></h2>
          <p className="mw-copy mw-copy--light">
            Send us your idea, drawing or photo. We&rsquo;ll help turn it into custom millwork built
            specifically for your home.
          </p>
          <div className="mw-actions">
            <QuoteButton />
            <CallLink />
          </div>
        </div>
      </section>
    </div>
  );
}
