import { createFileRoute } from "@tanstack/react-router";

import { KitchenJourney } from "@/components/kitchen-journey/kitchen-journey";
import {
  Footer,
  JsonLd,
  Nav,
  QuoteModal,
} from "@/components/site/site-chrome";
import { localBusiness, meta } from "@/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: meta.home.title },
      { name: "description", content: meta.home.description },
      { property: "og:title", content: meta.home.title },
      { property: "og:description", content: meta.home.description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <JsonLd data={localBusiness} />
      <Nav />
      <main className="pf-page">
        <KitchenJourney />
        <Footer />
      </main>
      <QuoteModal />
    </>
  );
}
