import { Star } from "lucide-react";

import { CardContent, GlassFilter, LiquidCard } from "@/components/ui/liquid-glass-card";
import { Marquee } from "@/components/ui/marquee";
import { reviews } from "@/site-content";

const dateFmt = new Intl.DateTimeFormat("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });

function initials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

/**
 * Review carousel. Renders nothing until real reviews are added to
 * `reviews` in site-content.ts — never fill it with invented reviews.
 */
export function ReviewsMarquee() {
  if (reviews.length === 0) return null;
  return (
    <section className="rv" aria-labelledby="rv-title">
      <div className="rv__head">
        <p className="mw-eyebrow mw-eyebrow--dark">What clients say</p>
        <h2 id="rv-title" className="rv__title">Trusted across Toronto &amp; the GTA.</h2>
      </div>
      <GlassFilter />
      <Marquee pauseOnHover speed="slow" className="rv__track">
        {reviews.map((r) => (
          <LiquidCard key={r.name + r.date} className="mx-1 h-full w-80 rounded-3xl border-[#ddd8cb] bg-white/40">
            <CardContent className="p-6 py-0">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2e4a3e] text-sm font-bold text-[#f3f0e8]" aria-hidden="true">
                  {initials(r.name)}
                </span>
                <div>
                  <h3 className="font-semibold text-[#1c2220]">{r.name}</h3>
                  <p className="text-sm text-[#5b625e]">
                    {r.project} · <time dateTime={r.date}>{dateFmt.format(new Date(r.date))}</time>
                  </p>
                </div>
              </div>
              <p className="mb-3 text-[#1c2220]">&ldquo;{r.text}&rdquo;</p>
              <div className="flex gap-1" role="img" aria-label={`${r.rating} out of 5 stars`}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#b98a55] text-[#b98a55]" aria-hidden="true" />
                ))}
              </div>
              {r.source ? <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#8a8f8b]">via {r.source}</p> : null}
            </CardContent>
          </LiquidCard>
        ))}
      </Marquee>
    </section>
  );
}

export { ReviewsMarquee as Component };
