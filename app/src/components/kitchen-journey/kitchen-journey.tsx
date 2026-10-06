/* ===========================================================================
 * Promift — the kitchen journey component.
 *
 * Three modes, decided on mount:
 *   live   — capable desktop: a real-time WebGL room (three, loaded lazily so
 *            SSR never sees it)
 *   film   — phones / low-power / no WebGL: the pre-rendered film of the same
 *            camera path, scrubbed by scroll
 *   stills — prefers-reduced-motion: the same chapters as still frames
 *
 * Progress is computed in a rAF loop from the sticky wrapper's own rect (no
 * scroll listener), and every visual is a pure function of that number, so the
 * journey lands on the same final frame at any scroll speed, forward or back.
 * ========================================================================= */

import { useEffect, useRef, useState } from "react";

import { chapters, site } from "@/site-content";
import { scrollScrubScenes } from "@/scroll-scrub-scenes";

const FILM = scrollScrubScenes[0];

const STILLS = [
  "/assets/world/still-01.jpg",
  "/assets/world/still-02.jpg",
  "/assets/world/still-03.jpg",
  "/assets/world/still-04.jpg",
  "/assets/world/still-05.jpg",
  "/assets/world/still-06.jpg",
  "/assets/world/still-07.jpg",
];

type Mode = "live" | "film" | "stills";

type SceneHandle = {
  applyProgress: (p: number) => void;
  render: () => void;
  resize: (w: number, h: number) => void;
  dispose: () => void;
};

function QuoteActions({ showQuote = true }: { showQuote?: boolean }) {
  return (
    <div className="pf-hero__actions">
      {showQuote ? (
        <button type="button" className="pf-cta-quote" data-quote-open>
          <span className="pf-cta-quote__bar" aria-hidden="true" />
          Free quote
        </button>
      ) : null}
      <a className="pf-cta-call" href={`tel:${site.phoneTel}`}>
        {site.phoneDisplay}
      </a>
    </div>
  );
}

export function KitchenJourney() {
  const scrubRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chaptersRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  // SSR renders the journey layout (film branch, no source yet, so nothing is
  // fetched); the effect then promotes to live 3D, keeps the film, or swaps to
  // the still-frame layout under prefers-reduced-motion.
  const [mode, setMode] = useState<Mode>("film");
  const [filmSrc, setFilmSrc] = useState<string | null>(null);

  // ---- decide the mode once, on the client ------------------------------
  useEffect(() => {
    let cancelled = false;

    const decide = async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        if (!cancelled) setMode("stills");
        return;
      }

      const nav = navigator as Navigator & {
        deviceMemory?: number;
        connection?: { saveData?: boolean };
      };
      const small = window.matchMedia("(max-width: 860px), (pointer: coarse)").matches;
      const weak =
        (nav.hardwareConcurrency ?? 8) <= 4 ||
        (nav.deviceMemory ?? 8) <= 4 ||
        nav.connection?.saveData === true;

      let gl = false;
      try {
        const mod = await import("./kitchen-scene");
        gl = mod.hasWebGL();
      } catch {
        gl = false;
      }

      if (cancelled) return;
      setFilmSrc(small && FILM.mobileClip ? FILM.mobileClip : FILM.clip);
      void gl; void weak;
      setMode("film"); // the cinematic renovation film plays on every device
    };

    void decide();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- drive the journey from scroll position ---------------------------
  useEffect(() => {
    if (mode === "stills") return;
    const scrub = scrubRef.current;
    const stage = stageRef.current;
    if (!scrub || !stage) return;

    let raf = 0;
    let disposed = false;
    let scene: SceneHandle | null = null;
    let measure: (() => void) | null = null;
    let filmDuration = 0;
    let pendingSeek = false;
    let seekTimer: ReturnType<typeof setTimeout> | null = null;

    const video = videoRef.current;

    const applyChapters = (p: number) => {
      const wrap = chaptersRef.current;
      if (!wrap) return;
      let active = 0;
      for (let i = 0; i < chapters.length; i += 1) {
        const from = chapters[i]?.at ?? 0;
        const to = i + 1 < chapters.length ? (chapters[i + 1]?.at ?? 1) : 1.0001;
        if (p >= from && p < to) active = i;
      }
      wrap.querySelectorAll<HTMLElement>("[data-chapter-index]").forEach((node) => {
        node.dataset.active = Number(node.dataset.chapterIndex) === active ? "true" : "false";
      });
      const rail = railRef.current;
      if (rail) {
        rail.querySelectorAll<HTMLElement>("[data-rail]").forEach((button) => {
          if (Number(button.dataset.rail) === active) button.setAttribute("aria-current", "step");
          else button.removeAttribute("aria-current");
        });
      }
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const rect = scrub.getBoundingClientRect();
      const total = scrub.offsetHeight - window.innerHeight;
      const p = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;

      progressRef.current?.style.setProperty("--pf-p", String(p));
      applyChapters(p);

      if (scene) {
        scene.applyProgress(p);
        scene.render();
      } else if (video && filmDuration > 0 && !pendingSeek) {
        const target = p * Math.max(filmDuration - 0.05, 0);
        if (Math.abs(video.currentTime - target) > 0.04) {
          pendingSeek = true;
          video.currentTime = target;
          if (seekTimer) clearTimeout(seekTimer);
          seekTimer = setTimeout(() => {
            pendingSeek = false;
          }, 360);
        }
      }
    };

    const start = async () => {
      if (mode === "live" && canvasRef.current) {
        try {
          const { KitchenScene } = await import("./kitchen-scene");
          if (disposed || !canvasRef.current) return;
          scene = new KitchenScene(canvasRef.current);
          const stageEl = stageRef.current;
          if (stageEl) {
            measure = () => {
              const box = stageEl.getBoundingClientRect();
              scene?.resize(box.width, box.height);
            };
            measure();
            window.addEventListener("resize", measure);
          }
        } catch {
          scene = null;
        }
      }
      if (video) {
        const onMeta = () => {
          filmDuration = Number.isFinite(video.duration) ? video.duration : 0;
        };
        if (video.readyState >= 1) onMeta();
        else video.addEventListener("loadedmetadata", onMeta, { once: true });
      }
      raf = requestAnimationFrame(loop);
    };

    void start();

    const onSeeked = () => {
      pendingSeek = false;
      if (seekTimer) clearTimeout(seekTimer);
    };
    video?.addEventListener("seeked", onSeeked);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      if (measure) window.removeEventListener("resize", measure);
      video?.removeEventListener("seeked", onSeeked);
      if (seekTimer) clearTimeout(seekTimer);
      scene?.dispose();
    };
  }, [mode]);

  const goTo = (p: number) => {
    const scrub = scrubRef.current;
    if (!scrub) return;
    const total = scrub.offsetHeight - window.innerHeight;
    const top = scrub.getBoundingClientRect().top + window.scrollY + p * total;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // ---- reduced motion: the same walk as still frames --------------------
  if (mode === "stills") {
    return (
      <section id="walk" className="pf-journey" data-mode="stills">
        <div className="pf-band pf-band--ink">
          <div className="pf-shell">
            <p className="pf-kicker">{chapters[0]?.kicker}</p>
            <h1 className="pf-h2">{chapters[0]?.title}</h1>
            <p className="pf-lede">{chapters[0]?.body}</p>
            <div className="pf-hero__actions" style={{ marginTop: "1.8rem" }}>
              <QuoteActions showQuote={false} />
            </div>
          </div>
        </div>
        {chapters.map((chapter, index) => (
          <article
            className="pf-stills__chapter pf-shell"
            key={chapter.id}
            data-align={chapter.align}
          >
            <div className="pf-stills__media">
              <img
                src={STILLS[index] ?? STILLS[0]}
                alt={`Promift kitchen walk, ${chapter.title}`}
                width={1280}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div>
              <h2 className="pf-h2">{chapter.title}</h2>
              <p className="pf-lede">{chapter.body}</p>
              {chapter.tags ? (
                <ul className="pf-journey__tags" style={{ marginTop: "1.2rem" }}>
                  {chapter.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </section>
    );
  }

  // ---- live 3D / filmed walk -------------------------------------------
  return (
    <section id="walk" className="pf-journey" data-mode={mode}>
      <div className="pf-journey__scrub" ref={scrubRef}>
        <div className="pf-journey__stage" ref={stageRef}>
          <div className="pf-journey__boot" aria-hidden="true" />

          {mode === "live" ? (
            <canvas
              ref={canvasRef}
              className="pf-journey__layer pf-journey__canvas"
              aria-hidden="true"
            />
          ) : (
            <video
              ref={videoRef}
              className="pf-journey__layer pf-journey__film"
              src={filmSrc ?? undefined}
              poster={FILM.poster}
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
            />
          )}

          <p className="pf-journey__caption">Concept visualization — showing how a kitchen renovation can transform your space.</p>
          <div className="pf-journey__progress" aria-hidden="true">
            <span ref={progressRef} />
          </div>

          <div className="pf-journey__chapters" ref={chaptersRef}>
            {chapters.map((chapter, index) => (
              <article
                className="pf-journey__chapter"
                key={chapter.id}
                data-chapter-index={index}
                data-align={chapter.align}
                data-active={index === 0 ? "true" : "false"}
              >
                <div className="pf-journey__copy">
                  {chapter.kicker ? (
                    <p className="pf-journey__kicker">{chapter.kicker}</p>
                  ) : null}
                  {index === 0 ? (
                    <h1 className="pf-journey__title">{chapter.title}</h1>
                  ) : (
                    <h2 className="pf-journey__title">{chapter.title}</h2>
                  )}
                  <p className="pf-journey__body">{chapter.body}</p>
                  {chapter.tags ? (
                    <ul className="pf-journey__tags">
                      {chapter.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}
                  {index === 0 ? <QuoteActions showQuote={false} /> : index === chapters.length - 1 ? <QuoteActions /> : null}
                </div>
              </article>
            ))}
          </div>

          <div className="pf-journey__rail" aria-label="Chapters" ref={railRef}>
            {chapters.map((chapter, index) => (
              <button
                key={chapter.id}
                type="button"
                data-rail={index}
                aria-label={chapter.title}
                aria-current={index === 0 ? "step" : undefined}
                onClick={() => goTo(chapter.at)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
