---
name: Rafael Sant' Anna Portfolio
description: A showroom for working software with two doors, one for local businesses and one for companies. The frame is quiet and personal; the color comes from the projects.
---

# Design System: Rafael Sant' Anna Portfolio (v3, "Showroom")

## Why this version exists

Rafael's client work cannot be shown, so the portfolio proves capability with working demonstrations he designed and built, each with a fictional brand, fictional data, and its own art direction. Visitors open them and use them. Real professional experience stays, as text, in About and CV.

Since November 2026 the site serves two audiences: small local businesses in Brazil buying a fixed-price website, and companies looking for systems, apps, and AI. The home opens with both doors, the `/sites/` section speaks only to business owners, and the systems keep their technical depth.

The portfolio behaves like a gallery: a restrained frame with one violet signal, in a dark or light theme, so each project's own palette carries the color. It must feel personal, engineered, and alive, never like a template.

## Audience and first ten seconds

- A business owner arriving from WhatsApp or Google must see, in plain Portuguese, that Rafael builds the page of their business in 3 business days from R$ 700, see a working model of their segment, and reach WhatsApp.
- A company must see who Rafael is, that he builds real interfaces end to end, that they can try the systems right now, and how to contact him.

## Foundations

- Themes: dark is the default; a light theme mirrors every token. The head script applies the saved choice (`localStorage` key `theme`) or the system preference before first paint, and a sun/moon toggle in the header switches it. Demos keep their own fixed art direction and ignore the portfolio theme.
- Dark tokens: canvas `#09090D`; surfaces `#111118`, `#191922`, `#22222D`; hairlines `rgb(255 255 255 / 8%)` and `/ 16%`; text `#F5F4FA`, soft `#C3C0CF`, muted `#9592A3`; violet `#A98BFF` (strong `#8C6CFF`, soft fill `rgb(169 139 255 / 14%)`, ink on violet `#0B0614`).
- Light tokens: canvas `#F6F5FA`; surfaces `#FFFFFF`, `#F0EEF6`, `#E6E3EF`; hairlines `rgb(24 20 44 / 10%)` and `/ 17%`; text `#16131F`, soft `#464257`, muted `#67627A`; violet `#6545D8` (strong `#5636C9`, ink on violet `#FFFFFF`). Every text pair meets WCAG AA.
- Theme-dependent chrome tokens: `--header-bg`, `--scrim`, `--dot`, `--dot-strong`, `--fill-subtle`, `--shade`, `--shade-strong`. No hard-coded dark-only colors outside the token blocks in `base.css`.
- One signal color: violet for primary actions, focus, live states, and a few typographic accents. Never as large flat slabs, neon gradients, or gradient text.
- Project palettes (`project.palette`) tint stages, cards, borders on hover, pointer light, and the hero windows. They are the only other colors in the portfolio.
- Type: Geologica for display (500 to 800, tight negative tracking, very large sizes allowed), Atkinson Hyperlegible Next for reading, and a system monospace stack in small doses for technical labels. The UI must not imitate a terminal.
- Radii: 14px for panels and cards, 10px for windows and inputs, 999px for pills. Hairline borders instead of heavy shadows; one soft, large shadow is reserved for floating windows.
- Texture: an optional fine dot grid. Never glassmorphism, neon glows, radial spotlight backgrounds, or purple-to-pink gradients.

## Motion

Easing `cubic-bezier(0.16, 1, 0.3, 1)`; 180ms for feedback, 320ms for transitions, up to 700ms for entrances. Everything lives in `src/styles/motion.css` and `cards.css`, is progressive enhancement, and switches off with `prefers-reduced-motion`:

- Cross-document view transitions: the header stays still while the page fades and rises.
- Theme switch: a circle grows from the toggle (view transition), with a cross-fade fallback.
- Hero entrances: copy line by line, then the desk windows.
- Scroll-driven, only inside `@supports (animation-timeline: ...)`: reveals, gentle panning of screenshots inside frames, the phone previews scrolling to WhatsApp, and a reading progress bar under the header.
- Pointer light on cards, in the project's accent, fed by `pointer-light.ts`.

## Signature: the desk

The home hero pairs a large statement with a composition of overlapping application windows on a dot grid:

1. A portrait window with Rafael's original photograph (`/images/profile.jpg`). CSS framing only; the face is never regenerated or distorted.
2. Four small live windows built in HTML and CSS from each demo's own data, in its palette: a delivery chart for Trajeto, a cited answer for Bússola, time slots for Corte & Prosa, and a phone with a sync queue for Turno. Each links to its project.

On pointer devices the windows can be dragged by their title bars and gently float; a visible control restores the layout. Without JavaScript, with reduced motion, or on touch screens, the composition is static and complete. On phones the portrait comes first and the windows become a horizontal, snap-scrolling row.

## Demo cards

- **Landing-page card** (`LandingCard.astro`): a small phone with a dark bezel showing a 390px capture of the demo, stitched from its hero to its WhatsApp request (`/images/projects/{,en/}mobile/<slug>.webp`, 390 by 4000). As the card crosses the viewport the capture scrolls inside the phone; without scroll-driven animation it scrolls on hover. Beside it: segment, "Teste: …", and three facts (3 dias úteis, a partir de R$ X, botão no seu WhatsApp). The whole card links to the segment page (or the case page on `/work/`); "Abrir o modelo" opens the demo above that link. Horizontal at every width.
- **System card and exhibit** (`ProjectCard.astro`, `Exhibit.astro`): the framed screenshot on a linear palette tint, with the matching desk miniature floating over it (`SystemMini.astro`; Ventura has none). The whole card links to the case page; the demo link sits above it.
- Titles are styled by class, never by heading level. No global numbering across groups.

## Home composition

1. Header: Sites, Projects, Services, About, theme toggle, language switch, Contact.
2. The desk hero: availability pill, statement "Sites que trazem cliente. Sistemas que organizam o resto.", intro for both audiences, primary action "Quero um site para o meu negócio" to `/sites/`, secondary "Ver sistemas e apps" to the systems block, and a line with location, "Atendo Brasil e Portugal", and working hours.
3. The showroom: a short note that every project is an authorial demonstration, then "Sites para negócios locais" (seven landing cards, Clima Certa leading across the row) and "Sistemas, apps e IA" (five large alternating exhibits).
4. A slow, pausable capability strip (stack and practices), placed after the demos so it never sits between a business owner and the cards.
5. Services, experience band, FAQ (including the website price), and a contact close that names both routes.

## Small-business pages

- `/sites/`: offer hero with price box, the seven landing cards, how it works in four steps, the R$ 390 fix for existing sites, the engineer behind it, FAQ with FAQPage schema, and a close with Rafael's portrait and the WhatsApp number note.
- `/sites/<niche>/` for ar-condicionado, pousada, academia-de-luta, escola-de-danca, escola-de-musica, pet-shop, estetica-automotiva: segment hero with the framed demo, reasons, what goes on the page, a compact price box, steps, niche FAQ, the other segments, and the same close. Service with Offer schema in BRL.
- Both show a floating WhatsApp action once the hero leaves the screen and hide it near the close.
- WhatsApp links carry a prefilled message with the segment. Next to WhatsApp actions aimed at Brazil, `whatsappNote` explains the +351 number in one plain sentence.

## Inner pages

- Work: header, filter chips (All, Systems, AI, Websites, Mobile) that progressively enhance a list that is complete without JavaScript, landing cards for the seven websites and project cards for the five systems.
- Project page: back link, category, name, tagline, "Open live demo", disclosure, large framed preview, problem and approach, what can be tested, decisions, stack, related services, demo boundaries, previous and next project.
- Contact: two doors first ("Quero um site para o meu negócio" with WhatsApp and prices; "Tenho um projeto de sistema, app ou IA" pointing to the brief), then channels with copy feedback and the first-message brief.
- Services, service detail, About, CV, and For agents share the same system and stay comfortable for long reading.

## Demo pages

Every demo under `/demos/<slug>/` is a complete product page with its own art direction and no portfolio chrome. A compact Rafael-branded bar (`DemoBar`) states the authorial disclosure and links back to the project page, the portfolio, contact, and the other language. Demos never submit data, never call the network, and say so where an action would normally send something. No testimonials, ratings, client logos, real addresses, or business schema.

## Accessibility and quality bar

WCAG 2.2 AA in both themes. Every feature works with keyboard and screen readers, focus is always visible (violet outline on cards with stretched links), touch targets are at least 44px, meaning never depends on color or hover alone, and all content remains available without JavaScript. Layouts work at 320, 390, 768, 1280, and 1440 pixels and at 200% zoom with no horizontal scrolling. Visual quality is verified in a real browser at desktop and mobile sizes in both themes; a passing build does not prove it.

## Assets and delivery

- `/images/profile.jpg` is the original photograph and the only portrait in use.
- Project previews live in `/images/projects/<slug>.png` and `.webp` (1600 by 1000, plus 800 and 1200 variants, English under `/en/`) and are real screenshots of the demos. Phone strips live in `/images/projects/mobile/` and `/images/projects/en/mobile/`.
- Existing Astro stack, local fonts, no new dependencies. Brazilian Portuguese is the primary language at the root and `/en/` mirrors every page; former `/pt/` URLs redirect to the root.
