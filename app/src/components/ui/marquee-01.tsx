import { Star } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee-01-utils/marquee";
import { reviews, type Review } from "@/site-content";

const dateFmt = new Intl.DateTimeFormat("en-CA", { month: "short", year: "numeric", timeZone: "UTC" });

function initials(name: string) {
  return name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

const ReviewCard = ({ review }: { review: Review }) => (
  <Card className="relative h-full w-80 overflow-hidden rounded-2xl border border-[#ddd8cb] bg-white p-5 shadow-none">
    <CardContent className="flex flex-col gap-3 p-0">
      <div className="flex flex-row items-center gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2e4a3e] text-xs font-bold text-[#f3f0e8]" aria-hidden="true">
          {initials(review.name)}
        </span>
        <div className="flex min-w-0 flex-col">
          <p className="text-sm font-semibold text-[#1c2220]">{review.name}</p>
          <p className="text-xs text-[#5b625e]">
            {review.project}
            {review.location ? ` · ${review.location}` : null}
            {review.date ? <> · <time dateTime={review.date}>{dateFmt.format(new Date(review.date))}</time></> : null}
          </p>
        </div>
      </div>
      <div className="flex gap-0.5" role="img" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: review.rating }).map((_, i) => (
          <Star key={i} className="h-3.5 w-3.5 fill-[#b98a55] text-[#b98a55]" aria-hidden="true" />
        ))}
      </div>
      {review.title ? <p className="text-[0.95rem] font-semibold leading-snug text-[#1c2220]">&ldquo;{review.title}&rdquo;</p> : null}
      <p className="text-sm leading-relaxed text-[#4a514d]">{review.text}</p>
      {review.source ? <p className="text-[0.65rem] uppercase tracking-[0.14em] text-[#8a8f8b]">via {review.source}</p> : null}
    </CardContent>
  </Card>
);

/**
 * Two-row testimonial marquee. Renders nothing until REAL reviews are added
 * to `reviews` in site-content.ts — never fill it with invented reviews.
 */
export default function TestimonialMarquee() {
  if (reviews.length === 0) return null;
  const half = Math.ceil(reviews.length / 2);
  const firstRow = reviews.slice(0, half);
  const secondRow = reviews.length > 1 ? reviews.slice(half) : reviews;
  return (
    <section className="rv" aria-labelledby="rv-title">
      <div className="rv__head">
        <p className="mw-eyebrow mw-eyebrow--dark">What clients say</p>
        <h2 id="rv-title" className="rv__title">Trusted across Toronto &amp; the GTA.</h2>
      </div>
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:40s]">
          {firstRow.map((r) => <ReviewCard key={r.name} review={r} />)}
        </Marquee>
        {secondRow.length ? (
          <Marquee reverse pauseOnHover className="[--duration:40s]">
            {secondRow.map((r) => <ReviewCard key={r.name} review={r} />)}
          </Marquee>
        ) : null}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-[#f3f0e8]" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-[#f3f0e8]" />
      </div>
    </section>
  );
}
