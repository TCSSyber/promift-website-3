import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Phone } from "lucide-react";

import { QuoteWizard } from "@/components/contact/quote-wizard";
import { ReviewsMarquee } from "@/components/ui/marquee-card";
import { Footer, JsonLd, Nav, QuoteModal } from "@/components/site/site-chrome";
import { localBusiness, meta, site } from "@/site-content";

export const Route = createFileRoute("/quote")({
  head: () => ({
    meta: [
      { title: meta.quote.title },
      { name: "description", content: meta.quote.description },
      { property: "og:title", content: meta.quote.title },
      { property: "og:description", content: meta.quote.description },
      { name: "robots", content: "index, follow, max-image-preview:large" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <>
      <JsonLd data={localBusiness} />
      <Nav />
      <main className="pf-page mw ct">
        <section className="ct-hero" aria-labelledby="ct-title">
          <img className="ct-hero__img" src="/assets/kitchen/hero.webp" alt="" width={1344} height={752} fetchPriority="high" />
          <div className="ct-hero__shade" aria-hidden="true" />
          <div className="ct-hero__inner">
            <p className="mw-eyebrow">Free consultation &amp; quote</p>
            <h1 id="ct-title">Let&rsquo;s Build <em>Your Vision.</em></h1>
            <p>Tell us about your project and we&rsquo;ll get back to you with a free consultation and quote.</p>
            <div className="mw-actions">
              <a className="mw-btn mw-btn--solid" href="#start">Start free quote <ArrowRight size={16} aria-hidden="true" /></a>
              <a className="mw-call" href={`tel:${site.phoneTel}`}><Phone size={16} aria-hidden="true" /> {site.phoneDisplay}</a>
            </div>
          </div>
        </section>
        <ReviewsMarquee />
        <section className="ct-formsec" id="start" aria-label="Free quote form">
          <QuoteWizard />
        </section>
        <Footer />
      </main>
      <QuoteModal />
    </>
  );
}
