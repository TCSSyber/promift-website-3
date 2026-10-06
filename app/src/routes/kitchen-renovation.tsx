import { createFileRoute } from "@tanstack/react-router";

import { KitchenPage } from "@/components/kitchen/kitchen-page";
import { Footer, JsonLd, Nav, QuoteModal } from "@/components/site/site-chrome";
import { localBusiness, meta } from "@/site-content";

export const Route = createFileRoute("/kitchen-renovation")({
  head: () => ({
    meta: [
      { title: meta.kitchen.title },
      { name: "description", content: meta.kitchen.description },
      { property: "og:title", content: meta.kitchen.title },
      { property: "og:description", content: meta.kitchen.description },
    ],
  }),
  component: KitchenRoute,
});

function KitchenRoute() {
  return (
    <>
      <JsonLd data={localBusiness} />
      <Nav />
      <main className="pf-page">
        <KitchenPage />
        <Footer />
      </main>
      <QuoteModal />
    </>
  );
}
