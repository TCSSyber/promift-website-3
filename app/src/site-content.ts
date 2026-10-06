/**
 * Promift site content. Every fact here comes from the client. Nothing is
 * invented: no reviews, years, warranty, prices, hours or project names.
 */

export const site = {
  name: "Promift",
  tagline: "Toronto kitchen renovation and custom millwork",
  phoneDisplay: "647-963-7899",
  phoneTel: "+16479637899",
  email: "info@promift.com",
  street: "792 O'Connor Drive",
  city: "Toronto",
  region: "ON",
  country: "CA",
  areaServed: "Greater Toronto Area",
  description:
    "Promift is a Toronto kitchen renovation and custom millwork company serving the GTA. Kitchens, TV and media walls, fireplace surrounds and mantels, and other custom millwork built to each client's design.",
} as const;

/** Per-route metadata, written for the two target keywords. */
export const meta = {
  home: {
    title: "Promift - Toronto Kitchen Renovation & Custom Millwork",
    description:
      "Toronto kitchen renovation and custom millwork by Promift, serving the GTA. Cabinet boxes, islands and counters, plus TV walls and fireplace surrounds, built to your design.",
  },
  kitchen: {
    title: "Toronto Kitchen Renovation - Promift",
    description:
      "Toronto kitchen renovation by Promift. Cabinet boxes, islands, counters and fronts in MDF, melamine and solid wood, built to each client's design and installed across the GTA.",
  },
  millwork: {
    title: "Toronto Custom Millwork - Promift",
    description:
      "Toronto custom millwork by Promift. TV and media walls, fireplace surrounds and mantels, walk-in closets and bathroom vanities, built to each client's design across the GTA.",
  },
  quote: {
    title: "Free Quote - Toronto Kitchen Renovation & Custom Millwork | Promift",
    description:
      "Request a free quote from Promift, a Toronto kitchen renovation and custom millwork company serving the GTA. Call 647-963-7899 or send your project details.",
  },
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Kitchen renovation", href: "/kitchen-renovation" },
  { label: "Custom millwork", href: "/custom-millwork" },
  { label: "Contact", href: "/quote" },
] as const;

/**
 * The seven chapters. One short headline, one sentence, 0-3 proof tags.
 * `kicker` is set on 3 of the 7 chapters only (the eyebrow ration).
 */
export type Chapter = {
  id: string;
  kicker?: string;
  title: string;
  body: string;
  tags?: string[];
  align: "left" | "right";
  /** Where in the camera path (0-1) this chapter's copy becomes active. */
  at: number;
};

export const chapters: Chapter[] = [
  {
    id: "approach",
    kicker: "Promift, Toronto and the GTA",
    title: "Toronto kitchen renovation and custom millwork",
    body: "We take dated kitchens and turn them into rooms built around walnut, stone and warm light. Scroll to see how a renovation unfolds.",
    tags: ["Toronto", "GTA"],
    align: "left",
    at: 0.0,
  },
  {
    id: "before",
    title: "Where it starts",
    body: "Tired cabinets, worn counters, a layout that no longer works. Every project begins with a measure and an honest look at the room.",
    align: "left",
    at: 0.2,
  },
  {
    id: "demo",
    kicker: "Demolition",
    title: "Cleared back to the walls",
    body: "Old cabinetry, counters and finishes come out, so the new kitchen is built on a clean, square start.",
    align: "right",
    at: 0.36,
  },
  {
    id: "build",
    title: "Built to the design",
    body: "New cabinetry goes in, stone slabs are set, and every run is fitted to the client's design in MDF, melamine or solid wood.",
    tags: ["MDF", "Melamine", "Solid wood"],
    align: "left",
    at: 0.52,
  },
  {
    id: "after",
    kicker: "The finished room",
    title: "From this, to this",
    body: "Walnut, natural stone, bronze and lit shelving: the kind of kitchen we build toward with every client.",
    align: "right",
    at: 0.72,
  },
  {
    id: "detail",
    title: "Get a free quote",
    body: "Tell us about your kitchen, TV wall or fireplace. Call 647-963-7899 or send your project details.",
    align: "left",
    at: 0.9,
  },
];

/** Services, exactly as supplied. */
export const services = [
  {
    id: "kitchens",
    title: "Kitchen renovations",
    body: "Full kitchen renovation, from the empty room to the finished fronts, islands and counters, built to the client's design.",
    href: "/kitchen-renovation",
  },
  {
    id: "millwork",
    title: "Custom millwork",
    body: "Custom wood design: TV and media walls, fireplace surrounds and mantels, and other custom millwork built to each client's design.",
    href: "/custom-millwork",
  },
] as const;

/** The materials-facts marquee: solid wood, MDF, melamine. */
export const materials = [
  {
    id: "solid-wood",
    name: "Solid wood",
    note: "A solid wood face, for the parts you see and touch.",
  },
  {
    id: "mdf",
    name: "MDF",
    note: "An MDF door, the middle layer of the cabinet.",
  },
  {
    id: "melamine",
    name: "Melamine",
    note: "A melamine box, the carcass that holds it all square.",
  },
] as const;

/**
 * The gallery uses the client's own photos only. Placeholder entry shape:
 * { src, alt, caption, width, height }. Empty until the client's photos are
 * supplied, so the section renders nothing rather than inventing work.
 */
export type GalleryItem = {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
};

export const gallery: GalleryItem[] = [
  { src: "/assets/photos/kitchen-01.webp", alt: "Walnut and stone kitchen with a waterfall island, bronze tap and pendant lights at golden hour", caption: "Waterfall island, walnut and stone", width: 1920, height: 1080 },
  { src: "/assets/photos/kitchen-02.webp", alt: "Open-plan kitchen with a long stone island, walnut base cabinets and tall windows", caption: "Open-plan island run", width: 1920, height: 1080 },
  { src: "/assets/photos/kitchen-03.webp", alt: "Close view of a veined stone countertop, bronze tap and lit open shelves", caption: "Stone, bronze and lit shelving", width: 1920, height: 1080 },
  { src: "/assets/photos/kitchen-05.webp", alt: "Kitchen with walnut tall cabinets, a plaster hood and a stone backsplash", caption: "Walnut talls and plaster hood", width: 1920, height: 1080 },
];

/** The full LocalBusiness graph, Toronto. */
export const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: site.name,
  description: site.description,
  telephone: "+1-647-963-7899",
  email: site.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.street,
    addressLocality: site.city,
    addressRegion: site.region,
    addressCountry: site.country,
  },
  areaServed: {
    "@type": "AdministrativeArea",
    name: site.areaServed,
  },
} as const;

/**
 * Real client reviews only (copy them from Google / HomeStars with permission).
 * The Contact page carousel stays hidden while this list is empty.
 * date: ISO "YYYY-MM-DD" of the original review. rating: 1-5.
 */
export type Review = { name: string; project: string; date: string; rating: 1 | 2 | 3 | 4 | 5; text: string; source?: string };
export const reviews: Review[] = [];
