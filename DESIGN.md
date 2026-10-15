---
name: Rafael Sant' Anna Portfolio
description: A dark showroom for working software. The frame is quiet and personal; the color comes from the projects.
---

# Design System: Rafael Sant' Anna Portfolio (v3, "Showroom")

## Why this version exists

The previous version was correct but forgettable: a dark page, a photo, and case studies illustrated with diagrams because the real client work cannot be shown. Version 3 changes the evidence model. The portfolio now presents working demonstrations that Rafael designed and built, each with a fictional brand, fictional data, and its own art direction. Visitors open them and use them. Real professional experience stays, as text, in About and CV.

The portfolio itself behaves like a gallery: a near-black, monochrome frame with one violet signal, so each project's own palette carries the color. The site must feel personal, engineered, and alive, never like a template.

## Audience and first ten seconds

Brazilian founders, product leaders, tech leads, and small and medium businesses looking for a senior freelance developer. Rafael currently holds a full-time role (Fundacred), so the site offers freelance work only. Within ten seconds they must see who Rafael is, that he builds real interfaces end to end, that they can try the work right now, and how to contact him.

## Foundations

- Canvas `#09090D`; raised surfaces `#111118` and `#191922`; hairlines `rgb(255 255 255 / 8%)` and `rgb(255 255 255 / 16%)`.
- Text `#F5F4FA`, soft `#C3C0CF`, muted `#9592A3`. Body text always meets WCAG AA on its surface.
- One signal color: violet `#A98BFF` (strong `#8C6CFF`, soft fill `rgb(169 139 255 / 14%)`, ink on violet `#0B0614`). Use it for primary actions, focus, live states, and a few typographic accents. Never as large flat slabs or neon gradients.
- Project palettes (`project.palette`) tint project frames, cards, and the hero windows. They are the only other colors in the portfolio.
- Type: Geologica for display (500 to 800, tight negative tracking, very large sizes allowed), Atkinson Hyperlegible Next for reading, and a system monospace stack (`ui-monospace, 'Cascadia Code', Consolas, monospace`) in small doses for technical labels. The UI must not imitate a terminal.
- Radii: 14px for panels and cards, 10px for windows and inputs, 999px for pills. Hairline borders instead of heavy shadows; one soft, large shadow is reserved for floating windows.
- Motion: `cubic-bezier(0.16, 1, 0.3, 1)`; 180ms for feedback, 320ms for transitions, up to 700ms for entrances. Scroll-driven effects only through `animation-timeline: view()` inside `@supports`, so unsupported browsers see the final state.
- Texture: an optional fine dot grid and a very subtle grain. Never glassmorphism, never neon glows, never purple-to-pink gradients.

## Signature: the desk

The home hero pairs a large statement with a composition of overlapping application windows on a dot grid:

1. A portrait window with Rafael's original photograph (`/images/profile.jpg`). CSS framing and a light grade only; the face is never regenerated or distorted.
2. Four small live windows, built in HTML and CSS rather than screenshots, each in the palette of one demo: a delivery chart for Trajeto, time chips for Corte & Prosa, a cited answer for Bússola, and a phone with a sync queue for Turno. Each window links to its project.

On pointer devices the windows can be dragged by their title bars and gently float; a visible control restores the layout. Without JavaScript, with reduced motion, or on touch screens, the composition is static and complete. On phones the portrait comes first and the windows become a horizontal, snap-scrolling row.

## Home composition

1. Header with brand, Work, Services, About, Contact, and language switch.
2. The desk hero: availability pill, statement (`copy.heroTitle`), intro, primary action to the projects, secondary action to contact, and a short line with location and working model.
3. A slow, pausable capability strip (stack and practices). Static under reduced motion.
4. The showroom: the five product demos as large alternating exhibits (framed preview on a palette-tinted panel, index, category, name, tagline, what can be tested, "Open live demo" and "About the project"), followed by the two landing pages as a smaller pair. A visible note says the projects are authorial demonstrations with fictional brands and data.
5. Services as large interactive rows, each linking to the demos that illustrate it.
6. Experience in one compact band: four employers with years and roles, CV-backed figures, and the organizations served as plain text. No client logos.
7. Contact close: a large question, email with copy-to-clipboard feedback in a live region, WhatsApp, LinkedIn, and CV.

## Inner pages

- Work: header, filter chips (All, Systems, AI, Websites, Mobile) that progressively enhance a list that is complete without JavaScript, and the seven project cards.
- Project page: back link, category, name, tagline, "Open live demo", disclosure, large framed preview, problem and approach, what can be tested, decisions, stack, related services, demo boundaries, previous and next project.
- Services, service detail, About (story, portrait, detailed experience), CV, Contact, and For agents share the same system and stay comfortable for long reading.

## Demo pages

Every demo under `/demos/<slug>/` is a complete product page with its own art direction and no portfolio chrome. A compact Rafael-branded bar (`DemoBar`) states the authorial disclosure and links back to the project page, the portfolio, contact, and the other language. Demos never submit data, never call the network, and say so where an action would normally send something. No testimonials, ratings, client logos, real addresses, or business schema.

## Accessibility and quality bar

WCAG 2.2 AA. Every feature works with keyboard and screen readers, focus is always visible, touch targets are at least 44px, meaning never depends on color or hover alone, and all content remains available without JavaScript. Layouts work at 320, 390, 768, 1280, and 1440 pixels and at 200% zoom with no horizontal scrolling. Visual quality is verified in a real browser at desktop and mobile sizes; a passing build does not prove it.

## Assets and delivery

- `/images/profile.jpg` is the original photograph and the only portrait in use.
- Project previews live in `/images/projects/<slug>.png` and `.webp` (1600 by 1000) and are real screenshots of the demos.
- Existing Astro stack, local fonts, no new dependencies. Brazilian Portuguese is the primary language at the root and `/en/` mirrors every page; former `/pt/` URLs redirect to the root.
