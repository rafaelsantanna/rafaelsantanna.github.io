---
name: Rafael Sant' Anna Portfolio
description: A clean light Swiss document for a senior engineer who builds the software behind complex operations.
colors:
  paper: "oklch(98.5% 0.004 250)"
  paper-soft: "oklch(96% 0.006 250)"
  paper-strong: "oklch(92% 0.01 250)"
  ink: "oklch(22% 0.02 260)"
  ink-soft: "oklch(40% 0.025 260)"
  muted: "oklch(52% 0.03 260)"
  cobalt: "oklch(50% 0.18 260)"
  cobalt-deep: "oklch(36% 0.15 260)"
  line: "oklch(88% 0.01 250)"
typography:
  display:
    fontFamily: "Geologica, Arial Narrow, sans-serif"
    fontSize: "clamp(2.75rem, 1.9rem + 3.4vw, 5rem)"
    fontWeight: 620
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Geologica, Arial Narrow, sans-serif"
    fontSize: "clamp(1.9rem, 1.5rem + 1.6vw, 3rem)"
    fontWeight: 620
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Geologica, Arial Narrow, sans-serif"
    fontSize: "clamp(1.25rem, 1.15rem + 0.4vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Verdana, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Geologica, Arial Narrow, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.08em"
rounded:
  sm: "0.45rem"
  md: "0.85rem"
  lg: "1.6rem"
  pill: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  section-sm: "clamp(2.5rem, 5vw, 5rem)"
  section-lg: "clamp(4rem, 8vw, 7rem)"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.78rem 1.1rem"
    height: "3rem"
  button-signal:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.78rem 1.1rem"
    height: "3rem"
  technology-chip:
    backgroundColor: "{colors.paper-soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.7rem"
---

# Design System: Rafael Sant' Anna Portfolio

## Overview

**Creative North Star: "Restrained Document"**

The interface reads like a clean light Swiss document: cool paper surfaces, ink text, one cobalt accent, hairline rules, and generous whitespace. Each page opens with one calm hero (index, title, short intro), then presents evidence as ordered proof lists with sequence numbers, and closes with a direct contact path by email or WhatsApp. Anchors are Linear docs, Stripe minimal, and Vercel light: flat surfaces, quiet structure, and type that does the work.

The system is static-first and progressively enhanced. The same hierarchy remains intact with JavaScript disabled, reduced motion enabled, long Portuguese copy, or a 320px viewport. It explicitly rejects terminal cosplay, generic AI marketing, editorial-magazine styling, neon signal colors, glass panels, gradient text, and template-like card grids.

**Key Characteristics:**
- One hero per page: index, title, and a short intro, then the content.
- Proof lists carry the evidence: numbered rows with title, summary, and a plain text link.
- Uniform frames: every image sits in the same plain frame with the same radius and hairline border.
- Cool paper creates the page, ink carries reading contrast, cobalt marks the single primary action.
- Flat by default: no shadows, no glow, no overlays on content images.
- CV and agent-facing routes use denser factual ledgers: identity context, ordered sections, and machine-readable file links prioritize trust over display.
- Semantic structure serves people, search engines, and agents from the same source.
- Responsive composition reflows deliberately at 72rem, 60rem, 48rem, and 23rem.

## Colors

Cool paper creates the page, ink carries reading contrast, and cobalt owns the one primary action per view. Warm cream and orange are not used.

### Primary
- **Paper / Soft / Strong:** the default canvas, grouped sections, and subtle contrast fields.
- **Cobalt / Deep:** the sole accent for the primary action, active route marker, and focus.

### Secondary
- **Line:** hairline rules that separate proof rows, timelines, and navigation.

### Neutral
- **Ink:** primary copy and headings.
- **Ink Soft:** supporting copy that stays close to full contrast.
- **Muted:** metadata, dates, and secondary annotations.

**The One Accent Rule.** Cobalt marks the primary action and the active state. If an element is not the primary action, it uses ink, muted, or line instead.

**The Flat Rule.** Surfaces stay flat at rest. Separation comes from paper tones and hairline rules, never shadows, glow, or overlays.

## Typography

**Display Font:** Geologica (with Arial Narrow and sans-serif fallbacks)

**Body Font:** Atkinson Hyperlegible Next (with Verdana and sans-serif fallbacks)

**Character:** Geologica supplies calm, engineered clarity for headings. Atkinson Hyperlegible Next keeps case studies, services, and CV content comfortable at every size. Both families are self-hosted.

### Hierarchy
- **Display** (620, fluid 2.75rem to 5rem, 1.05): one calm hero statement per page.
- **Headline** (620, fluid 1.9rem to 3rem, 1.08): section and page promises.
- **Title** (600, fluid 1.25rem to 1.5rem, 1.2): cases, services, and grouped evidence.
- **Body** (400, 1rem, 1.65): readable narrative with a hard maximum of 70 characters.
- **Label** (600, 0.8rem, 0.08em, uppercase): route indexes, section indexes, and factual metadata.

**The One Display Move Rule.** A screen may have one dominant typographic gesture. Supporting headings step down clearly and never compete with the H1.

## Elevation

The system uses no shadows. Depth comes from paper tones and hairline rules only. Interactive elements do not lift; focus is expressed with a visible cobalt outline rather than a glow.

**The Flat-by-Default Rule.** Surfaces remain flat at rest. If a component needs a permanent shadow to separate from its background, the tonal hierarchy is wrong.

## Components

Components are quiet and legible, with meaningful states and a complete non-hover experience.

### Buttons
- **Shape:** gently technical corners (0.45rem), never generic pill buttons except the navigation contact control.
- **Primary:** cobalt with paper text and at least 3rem height; one per view, reserved for the primary action.
- **Signal:** identical to primary (cobalt with paper text), kept only as a compatibility alias for the closing project CTA.
- **Hover / Focus:** underline or tonal deepening on hover; retain a 3px cobalt focus-visible outline with 4px offset.
- **Quiet:** transparent paper surface with a one-pixel line border.

### Chips
- **Style:** compact technology labels use a paper-soft surface, ink text, pill radius, and factual text only.
- **State:** chips are descriptive, not interactive filters; they never depend on hover.

### Cards / Containers
- **Corner Style:** uniform frames use the same small radius everywhere; proof rows remain square and structural.
- **Background:** flat paper tones only; no alternating brand fields.
- **Shadow Strategy:** none; refer to the flat-by-default rule.
- **Border:** one-pixel line rules separate proof rows, timelines, service routes, and navigation.
- **Internal Padding:** fluid spacing from 1.5rem to 5rem according to density and viewport.

### Navigation
- Desktop navigation keeps only Work, Services, About, Contact, and locale switching. CV and agent resources remain discoverable in the footer.
- At 72rem and below navigation becomes a native button-controlled two-row map; at 48rem it becomes two columns with 44px minimum targets.
- The active route is visible through a cobalt underline and `aria-current`, never color alone.

### Case Artifacts
- Real screenshots or plain authored diagrams turn verified delivery facts into legible records instead of simulated product imagery.
- Each artifact sits in the uniform plain frame while preserving the paper, ink, cobalt, and line visual language.

## Do's and Don'ts

### Do:
- **Do** use real screenshots or plain diagrams to explain a project.
- **Do** preserve at least 16px body text, 44px targets, strong focus, semantic headings, and reduced-motion parity.
- **Do** adapt long bilingual copy through reflow, wrapping, and fluid type rather than clipping.
- **Do** connect every service promise to verifiable experience and a direct contact path.
- **Do** keep cobalt reserved for the primary action according to the one-accent rule.

### Don't:
- **Don't** make a cheap copy of Ruben Marcus's black, green, terminal-inspired portfolio.
- **Don't** use generic AI tool marketing with neon gradients, glass panels, vague claims, and empty futuristic decoration.
- **Don't** use editorial-magazine styling with display serifs, tiny mono labels, and ornamental rules.
- **Don't** use repeated identical card grids and framework-logo walls without evidence or context.
- **Don't** revive the legacy Simplefolio layout, generic developer slogans, or unclear calls to action.
- **Don't** present authorial demonstrations as client work, or publish inflated metrics, implied client endorsements, or keyword stuffing.
