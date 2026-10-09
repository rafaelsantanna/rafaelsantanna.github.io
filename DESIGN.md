---
name: Rafael Sant' Anna Portfolio
description: A personal dark technical portfolio with real project evidence and a processed portrait.
---

# Design System: Rafael Sant' Anna Portfolio

## Direction

The portfolio should feel like an individual engineer's digital workbench, with a composed dark stage, original portrait, and tangible evidence of complex software. The first cobalt version failed because one flat color occupied the screen, its huge title crossed the face, and the room/chair distracted from Rafael. The user's visual references are `chrissgon.dev` and `rubenmarcus.dev`; borrow their care for motion, human presence, and real proof without copying their layout, portrait effect, green or cyan palette, or claims.

The audience is product leaders, founders, technical managers, and hiring teams. Within seconds they should see who Rafael is, what he builds, one relevant project, and a clear contact path.

## Foundations

- A near-black charcoal-violet canvas, slightly differentiated dark surfaces, ice-colored type, and one restrained electric-lavender accent. Tokens belong in `src/styles/base.css`. Strong contrast and readable body copy matter more than novelty.
- Self-hosted Geologica is the display face. Self-hosted Atkinson Hyperlegible Next handles paragraphs and case studies. A modest amount of monospace may label genuine technical artifacts; the UI must not imitate a terminal.
- Use precise alignment, visible spacing rhythm, and real photographic/project material. An atmospheric dot field or fine grid is acceptable if it supports depth and does not obscure content.
- Keep controls at least 44px where touch matters and body copy at least 16px. Responsive designs must work at 320px, 390px, 768px, and desktop sizes, including text enlargement.

## Home composition

1. Compact navigation with the existing brand, routes, language switch, and contact path.
2. A genuine split hero: human name, short truthful work statement, concise explanation, contact/work links on the left; Rafael's cutout portrait in its own space on the right. No headline over the face, no large solid accent rectangle. The cutout may use subtle CSS dot or scan texture, but must remain recognizably Rafael.
3. Real projects appear promptly: EdgeData carries the lead, with Trinks and the academic platform supporting it. Images must be readable and links explicit.
4. A useful decision interface relates constructing, evolving, or connecting software to the relevant real service and evidence. All information remains available without JavaScript.
5. A personal experience section and two clear engagement paths. Use existing verified facts only.
6. A direct contact close, not a second full-screen color slab.

## Inner pages

Carry the same dark identity into work, service, case, about, CV, contact, and agent resources while preserving comfortable long-form reading. Keep all five cases and all five current services, the authorial landing-page disclosure, evidence links, complete CV, contact data, and machine-facing routes. Screenshots are real assets and must not be excessively cropped, recolored, or simulated. The About page retains the original user-supplied photograph.

## Motion and accessibility

Use native CSS and small progressive enhancements: an initial entrance that establishes hierarchy, hover/focus feedback on work, and disclosure of evidence or service detail. Motion must be brief and purposeful. Reduced-motion users receive a complete static composition. No JavaScript leaves all essential content and links visible. Never hide the hero image behind a delayed reveal.

Focus states need high contrast on the dark canvas; hover cannot be the only way to reach information. The mobile menu retains keyboard, Escape, and expanded-state behavior. Contact copying reports success or failure through its live region. Avoid cursor replacement and scroll hijacking.

## Assets and delivery

- `/images/profile.jpg` is Rafael's original supplied photo. `/images/profile-cutout.png` is a transparent derived hero asset; preserve the original and use the derivative only if identity, edge quality, and performance pass inspection.
- Preserve current case images, their claims, alt text, and provenance. Do not invent clients, metrics, products, testimonials, or outcomes.
- Preserve English canonical pages and the Portuguese `/pt/` mirror, routes, hreflang, JSON-LD, Markdown alternatives, CV downloads, and machine-readable endpoints.
- Use the existing Astro stack and local fonts. No dependency installation is implicit in the design request.
- Complete the existing content/build/distribution checks and inspect the final pages in a browser at desktop and mobile sizes. Build success alone does not prove visual quality.
