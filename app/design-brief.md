# Promift — design brief

## Design read
For Toronto and GTA homeowners weighing a kitchen renovation or custom millwork,
in a quiet craft register: the site is a working drawing that assembles itself
into the finished room as you scroll.

## Concept spine
**The room builds itself around you.** The visitor walks a plan sheet: dusk
front door, hallway, an empty unfinished kitchen, then the room assembles
(carcasses rise, island slides, counter drops, doors close, dimensions draw),
the fronts morph, one cabinet opens into its materials, and the walk ends in
millwork and a finished kitchen at golden hour.

## Delivery tier
`spectacle` — the brief asks for a real-time 3D room, a scrubbed camera path,
and pinned scroll choreography.

## Locked palette (user-supplied brand colors)
- warm plaster grey `#DAD5CA` — walls, page field, drawing paper
- plaster shadow `#C7C1B4` — secondary surfaces, hairline rules
- pine ink `#171C17` — text, doorway, dark massing
- deep cabinet green `#2C4738` — cabinet boxes and doors
- deep cabinet green light `#3E5F4B` — front variants
- **natural oak `#BE8C54` — the single accent** (dimension lines, marks, CTAs)
- oak light `#D9B27F` — oak highlight / hover

Defense: the user named these four colors and one oak accent, so the palette is
brand-given, not defaulted. It reads as a woodshop, not as the banned
cream+brass family: the field is a grey plaster, the dark is a green ink, and
the accent is a warm oak used once.

## Locked type
- **Archivo Expanded** (variable, width 125) — display, nav, labels, buttons.
- **Source Serif 4** — body copy and long paragraphs.
Pairing justification: the brand asks for a technical, drawn quality (Archivo
Expanded, the lettering of a shop drawing) set against a human reading voice
(Source Serif 4). Self-hosted woff2, no external font links.

## Animation mode: animated-website
The journey is the page. Built as a real-time WebGL room the visitor travels
through with scroll, with the shipped scroll-scrub film kept as the low-power
mobile source and its poster as the reduced-motion still.

## Journey shape: single-shot
One continuous camera move for the fallback film (one clip, no seams, one
generation). The live 3D path is authored as one continuous camera curve, so
live and film describe the same walk.

## Journey (7 chapters)
1. **Arrival** — outside a Toronto front door at dusk. Focal: the lit doorway.
2. **Threshold** — through the door into a short hallway. Focal: the hall's end.
3. **The room before** — empty unfinished kitchen, studs and subfloor.
4. **The build** — carcasses rise, island slides in, counter drops, doors
   swing shut, millimetre dimension lines draw in the air.
5. **The fronts** — orbit the island; fronts morph Shaker, slab, two-tone,
   warm wood.
6. **Materials** — one tall cabinet explodes into solid wood face, MDF door,
   melamine box.
7. **Millwork** — glide through a doorway into a walk-in closet and a bathroom
   vanity, then settle on the finished kitchen at golden hour behind the quote.

Each chapter carries one short headline, one sentence, and 0-3 proof tags.
Eyebrow budget respected: the chapter kicker is used on chapters 1, 4 and 6 only.

## World grammar
Byte-identical style preamble across the whole journey: one interior
perspective, light from the right, dusk exterior falling to warm interior and
golden hour; warm plaster grey surfaces, pine ink shadow massing, deep cabinet
green millwork, natural oak accent; matte plaster and satin lacquer finishes; no
on-screen text anywhere in the 3D or the film (all type is HTML).

## Camera architecture
Single continuous curve: exterior dolly toward the door, push through the
threshold, track down the hallway, settle in the room, orbit the island, pull to
the exploded cabinet, glide through the millwork doorway, then ease out to the
golden-hour wide. Positional continuity is one curve; the build is a pure
function of scroll progress, so any scroll speed lands on the same frame.

## Mobile framing
Every focal point kept inside the center-safe area. Phones and low-power
devices get the pre-rendered film of the same path scrubbed by scroll; reduced
motion gets the still frames instead of either. The engine's mobile clip is the
lighter encode.

## Delivery budget
≤32 MiB desktop clips, ≤16 MiB mobile clips. Only one clip is shipped (the
mobile fallback film); live 3D ships no clip.

## Section plan (after the journey)
Journey (pinned, 7 chapters) · gallery (user photos, caption only) · materials
facts marquee · services (kitchen renovation / custom millwork) · quote modal +
golden-hour close · footer with NAP. Layout families: pinned journey, justified
photo wall, marquee band, two-column service split, closing form on a dark
field. No consecutive repeats.

## Asset plan
- Storyboard image (journey direction) — generated.
- Fallback film (mobile, one continuous take) — generated, encoded desktop-free.
- Launch cover + OG + favicon — generated via the branding pipeline.
- 3D materials: procedural, code-authored (plaster, lacquer, oak, ink) matched
  to the palette; no stock textures.
- Gallery + project imagery: **the client's own photos only.** None supplied yet,
  so the gallery stays empty rather than inventing work.

## CTA inventory
- "Free quote" — modal opener (nav + close section). Oak fill, ink label.
- "Call 647-963-7899" — tel link, outline garment with oak underline.
- "Start a quote" — the /quote page form submit (phone-first).
Each keeps its own interaction identity; no shared button utility.

## Honesty rules
No invented reviews, years, warranty, prices, hours or project names. Copy is
limited to the facts supplied: services (kitchen renovations; custom millwork
including TV and media walls, fireplace surrounds and mantels, and other custom
millwork to each client's design), materials (MDF, melamine, solid wood), and
the NAP above.
