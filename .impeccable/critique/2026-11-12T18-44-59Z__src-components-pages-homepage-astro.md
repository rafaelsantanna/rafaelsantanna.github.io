---
target: site inteiro (home, sites, cards de demo)
total_score: 25
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\rafael\\Desktop\\Projetos\\My\\Portfolio\\site\\src\\components\\pages\\HomePage.astro"
target_fingerprint: "sha256:885d0539b8c1675f18830474fc68489af83e8b60dff0263291dd85a6349b5614"
target_path: "C:\\Users\\rafael\\Desktop\\Projetos\\My\\Portfolio\\site\\src\\components\\pages\\HomePage.astro"
timestamp: 2026-11-12T18-44-59Z
slug: src-components-pages-homepage-astro
---
Method: dual-agent (A design review, B detector). B's browser pass was rerun in the parent after A finished, because the dev server had stopped during B.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | Active nav, filter counts, copy feedback in live region, reading progress bar |
| 2 | Match System / Real World | 2 | /sites/ speaks owner language; home strip, services, contact leak RAG, RBAC, SaaS B2B |
| 3 | User Control and Freedom | 3 | Back links, DemoBar, demo reset |
| 4 | Consistency and Standards | 2 | Numbering and categories differ between home and /work/; h4 card titles unstyled |
| 5 | Error Prevention | 3 | Demos state they send nothing; explicit boundaries |
| 6 | Recognition Rather Than Recall | 3 | Visible text-labelled actions |
| 7 | Flexibility and Efficiency | n/a | Content site, no repeated task |
| 8 | Aesthetic and Minimalist Design | 3 | Clean frame; noise from 18-item stack strip and 14 identical violet buttons |
| 9 | Error Recovery | 3 | Little error surface |
| 10 | Help and Documentation | 3 | FAQ on home, /sites/ and each niche; contact brief |
| **Total** | | **25/36** | **Good (69%), at the edge of Acceptable** |

## Design Specificity Verdict

LLM: identity is specific (desk hero with live mini windows, two doors, honest /sites/ offer), but the demo cards are category-interchangeable: one mould for 12 art directions, browser chrome, URL pill, top crop, tagline repeating the screenshot headline, violet CTA on every card, generic hover lift.

Detector: CLI scan of portfolio markup found 3 advisory design-system-color findings (ContactPage.astro:242 violet at 10% alpha, CvPage.astro:294 print #fff/#111), all false positives. In-page scan: home 11, /work/ 10, /sites/ 1, /sites/pousada/ 0, home light 7. Rules: radial-spotlight-glow on every exhibit/project-card stage (agrees with the LLM verdict on the cards), gradient-text on .hero__accent (added by the new motion layer, conflicts with DESIGN.md), low-contrast inside hero mini windows (.m-slot.is-off 3.0:1 dark, a span at 4.4:1 light), marquee on the stack strip, oversized-h1 on home and /sites/ (intentional display type, judged acceptable), eyebrow chip on /work/. No user-visible overlay: the run was headless.

## Priority Issues

- [P1] Small-business path breaks outside /sites/: header Contact leads to a B2B brief ("Traga a parte difícil", team, format); services intro says "operações B2B complexas"; +351 number and Viseu, Portugal with no "atendo o Brasil em português pelo WhatsApp". Fix: two-door contact, rewrite services intro and home close for both audiences, explain the number. Command: /impeccable clarify
- [P1] Demo cards are flat (see cards section). Command: /impeccable bolder, then /impeccable animate
- [P2] Taxonomy, numbering and hierarchy bug: home says seven landing pages and five systems while /work/ counts Sites 8 and Systems 2; Trajeto is 08 on home and 01/12 on its page; ProjectCard gets headingLevel h4 but CSS styles only .project-card h3 (components.css:498), so landing-page names render small. Fix: style by class, one category for Corte & Prosa, numbering per group or none. Command: /impeccable polish
- [P2] Mobile: previews are 1600px desktop renders shrunk to ~300px, unreadable on /sites/ which asks to "open on your phone"; home is 17,249px tall; WhatsApp disappears after the /sites/ hero; URL pill truncated. Fix: mobile captures of landing pages and a discreet persistent WhatsApp action on /sites/*. Command: /impeccable adapt
- [P2] Stack strip right after the hero is a jargon wall between "Quero um site" and the cards; it is also a marquee. Fix: move it to the systems block or experience. Command: /impeccable distill

## Cards

Why flat: one template for 12 art directions; tagline repeats the screenshot H1; the signature interaction of each demo is invisible; motion is generic (6px lift, imperceptible pan, violet pointer light over amber or red palettes); brand erased (Geologica name, violet CTA everywhere, against "colour comes from the projects"); two equal CTAs per card.
Cross-cutting fix: whole card links to the project page, "Abrir a demo" secondary, light and focus in --p-accent, tagline replaced by "what you test here" + segment + price.
Concept A "Try it in the card": a static-by-default mini moment per demo built from existing assets (Lume headlight before/after range, Neblina day/night, Guarda Alta timetable row, Pipoca day builder, Clima symptom to cause, Compasso quiz question, Casa Clave four keys); systems reuse the hero minis.
Concept B "Brand cover": no browser chrome; card becomes a poster in the demo's art direction (--p-base, bleed hero photo, brand name in the demo's type, thin data strip), varied proportions.
Concept C "On the phone, down to WhatsApp": 390px mobile capture of each landing page inside a phone outline, scrolling with animation-timeline view() to the WhatsApp button; caption "3 dias, a partir de R$ 700, o botão cai no seu WhatsApp".
Recommendation: C for /sites/ and the landing group on home, A for systems.

## Persona Red Flags

Jordan (first-time owner): "Abrir a demo", "landing page", "/demos/..." pill mean nothing; niche pages use different verbs ("Abrir o modelo"); RAG/RBAC strip right after his button; Contact is a team brief; "dados estruturados" and "Search Console" unexplained.
Casey (mobile): CTAs only at the top, very long home, unreadable previews, WhatsApp not at hand while scrolling; touch targets fine.
Brazilian owner from a WhatsApp link: headline, price and Pix work; +351 and Viseu unexplained; no face on the niche page; pousada price box repeats the generic list; the visible "Esta página também responde a quem procura..." line reads as SEO filler.

## Minor Observations

Clima Certa lead card on home has a vertically centred body with empty space and a small title. Services repeat Bússola and Turno captures a third time. Light theme drains the tinted stages. On mobile the desk swipe hint cuts the Bússola window. PRODUCT.md and DESIGN.md are stale (B2B only, "seven cards", "stays dark", no light tokens or motion rules).

## Questions to Consider

If the card shows exactly the demo hero, what does the click add? Should home serve both audiences or route each to its own home in one scroll? Is +351 an asset or a liability for a R$ 700 buyer? Is Corte & Prosa a site or a system? Would one large "pick your segment" showcase beat seven cards?
