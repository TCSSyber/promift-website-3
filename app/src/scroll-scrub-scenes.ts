/**
 * Scene data for the scroll-scrub journey.
 *
 * Promift's primary experience is a live real-time WebGL room (see
 * components/kitchen-journey). This single-shot scene is the FALLBACK source:
 * its `mobileClip` / `mobilePoster` are the pre-rendered film of the same
 * camera path played on phones and low-power devices, and its desktop `poster`
 * is the still frame used under `prefers-reduced-motion`. The chapter copy
 * lives in `site-content.ts` so live 3D and film share one source of truth.
 *
 * Keep this array a module constant.
 */
import type {
  ScrollScrubScene,
  ScrollScrubTheme,
} from "@/components/scroll-scrub/scroll-scrub";

/** Brand tokens for the journey layer (from the design brief). */
export const scrollScrubTheme: ScrollScrubTheme = {
  accent: "#BE8C54",
  background: "#DAD5CA",
  ink: "#171C17",
  muted: "#5A5F55",
};

export const scrollScrubScenes: ScrollScrubScene[] = [
  {
    body: "The room assembles around the camera. Cabinet boxes rise, the island slides in, the counter drops on, doors swing shut and millimetre lines draw in the air.",
    clip: "/assets/world/journey.mp4",
    id: "journey",
    kicker: "Toronto kitchen renovation and custom millwork",
    label: "The walk",
    mobileClip: "/assets/world/journey-mobile.mp4",
    mobilePoster: "/assets/world/journey-mobile-poster.png",
    poster: "/assets/world/journey-poster.png",
    tags: ["Solid wood", "MDF", "Melamine"],
    title: "The room builds itself",
  },
];
