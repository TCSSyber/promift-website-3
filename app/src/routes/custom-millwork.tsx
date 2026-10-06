import { createFileRoute } from "@tanstack/react-router";

import { MillworkPage } from "@/components/millwork/millwork-page";
import { Footer, JsonLd, Nav, QuoteModal } from "@/components/site/site-chrome";
import { localBusiness, meta } from "@/site-content";

export const Route = createFileRoute("/custom-millwork")({
  head: () => ({
    meta: [
      { title: meta.millwork.title },
      { name: "description", content: meta.millwork.description },
      { property: "og:title", content: meta.millwork.title },
      { property: "og:description", content: meta.millwork.description },
    ],
  }),
  component: MillworkRoute,
});

function MillworkRoute() {
  return (
    <>
      <JsonLd data={localBusiness} />
      <Nav />
      <main className="pf-page">
        <MillworkPage />
        <Footer />
      </main>
      <QuoteModal />
    </>
  );
}
