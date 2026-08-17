---
name: Rafael Sant' Anna Portfolio
description: A cinematic signal room for a senior engineer who builds the software behind complex operations.
colors:
  signal-room: "oklch(15% 0.035 245)"
  signal-room-deep: "oklch(10.5% 0.03 245)"
  signal-room-raised: "oklch(20% 0.045 245)"
  ice: "oklch(96% 0.015 225)"
  mist: "oklch(83% 0.035 225)"
  edge-cyan: "oklch(76% 0.15 210)"
  edge-cyan-soft: "oklch(86% 0.09 210)"
  electric-blue: "oklch(58% 0.2 255)"
  electric-blue-deep: "oklch(40% 0.16 255)"
typography:
  display:
    fontFamily: "Geologica, Arial Narrow, sans-serif"
    fontSize: "clamp(3.5rem, 2.2rem + 5.3vw, 8.2rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Geologica, Arial Narrow, sans-serif"
    fontSize: "clamp(2.85rem, 2rem + 3vw, 5.6rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Geologica, Arial Narrow, sans-serif"
    fontSize: "clamp(1.45rem, 1.25rem + 0.75vw, 1.9rem)"
    fontWeight: 650
    lineHeight: 1.02
    letterSpacing: "-0.045em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, Verdana, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Geologica, Arial Narrow, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 620
    lineHeight: 1.25
    letterSpacing: "0.09em"
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
  section-lg: "clamp(4.5rem, 9vw, 9rem)"
components:
  button-primary:
    backgroundColor: "{colors.edge-cyan}"
    textColor: "{colors.signal-room-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.78rem 1.1rem"
    height: "3.35rem"
  button-signal:
    backgroundColor: "{colors.edge-cyan}"
    textColor: "{colors.signal-room-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.78rem 1.1rem"
    height: "3.35rem"
  technology-chip:
    backgroundColor: "{colors.signal-room}"
    textColor: "{colors.ice}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.7rem"
---

# Design System: Rafael Sant' Anna Portfolio

## Overview

**Creative North Star: "Operational Noir"**

The interface feels like a cinematic control surface during an important deployment: deep navy, cyan signals, electric-blue fields, live coordinates, and project evidence create a focused working atmosphere. Rafael's real portrait anchors the human presence through one cyan treatment, a quiet grid, and one restrained scan. The visual energy targets the finish of premium technical portfolios while avoiding surveillance motifs, green terminal cosplay, and generic minimalism.

The system is static-first and progressively enhanced. Motion reveals relationships without controlling comprehension; the same hierarchy remains intact with JavaScript disabled, reduced motion enabled, long Portuguese copy, or a 320px viewport. It explicitly rejects terminal cosplay, generic AI marketing, editorial-magazine styling, and template-like card grids.

**Key Characteristics:**
- Asymmetric maps and flows explain relationships instead of decorating empty space.
- The home hero uses one portrait, one scan, and desktop-only coordinates as the memorable signature; duplicated status, glitch, reticle, and floating tags are excluded.
- Internal page openings keep the coordinate-grid language but change composition by intent: visual evidence for work, delivery principles for services, factual ledgers for profile routes, and image-led case openings.
- Work and service indexes behave as visual ledgers: authored imagery, large sequence numbers, and full-row interaction replace generic card grids.
- Case studies, service routes, About, CV, Contact, and agent-facing pages share the same optical treatment while opening with distinct information structures.
- CV and agent-facing routes use denser operational ledgers: sticky identity context, asymmetric evidence blocks, and machine-readable file controls prioritize trust over spectacle.
- Cyan marks live signals and actions; electric blue carries brand depth and major fields.
- Alternating evidence rows replace interchangeable card grids.
- Semantic structure serves people, search engines, and agents from the same source.
- Responsive composition reflows deliberately at 72rem, 60rem, 48rem, and 23rem.

## Colors

Deep navy creates the room, ice carries reading contrast, cyan communicates active state, and electric blue owns the brand. Orange is not used.

### Primary
- **Signal Room / Deep:** the default canvas, navigation, hero, and technical fields.
- **Electric Blue / Deep:** the committed brand field for primary actions, case alternation, and experience sections.

### Secondary
- **Edge Cyan:** live status, active navigation, focus, selected nodes, and the closing CTA.

### Neutral
- **Ice:** primary copy and the contrasting selected-work field.
- **Mist:** long-form supporting copy.
- **Muted Coordinate:** metadata, dates, and secondary annotations.

**The Electric Field Rule.** Electric blue must carry the identity across major moments; never reduce it to a tiny generic accent.

**The Signal Rule.** Cyan marks an action, live status, or turning point. If it cannot be explained operationally, remove it.

## Typography

**Display Font:** Geologica (with Arial Narrow and sans-serif fallbacks)

**Body Font:** Atkinson Hyperlegible Next (with Verdana and sans-serif fallbacks)

**Character:** Geologica supplies engineered, compact authority without imitating a terminal. Atkinson Hyperlegible Next keeps case studies, services, and CV content comfortable at every size. Both families are self-hosted.

### Hierarchy
- **Display** (650, fluid 3.5rem–8.2rem, 1.02): one decisive hero statement, balanced to roughly ten characters per line.
- **Headline** (650, fluid 2.85rem–5.6rem, 1.02): section and page promises.
- **Title** (650, fluid 1.45rem–1.9rem, 1.02): cases, services, and grouped evidence.
- **Body** (400, 1rem, 1.62): readable narrative with a hard maximum of 70 characters.
- **Label** (620, 0.875rem, 0.09em, uppercase): route coordinates, section indexes, and factual metadata.

**The One Display Move Rule.** A screen may have one dominant typographic gesture. Supporting headings step down clearly and never compete with the H1.

## Elevation

The system uses no resting shadows. Depth comes from navy, electric-blue, cyan, and ice tonal fields, alternating composition, borders, overlap, and responsive movement. Interactive elements move by at most 3px; focus is expressed with a visible cyan outline rather than a glow.

**The Flat-by-Default Rule.** Surfaces remain flat at rest. If a component needs a permanent shadow to separate from its background, the tonal hierarchy is wrong.

## Components

Components are tactile and confident, with meaningful states and a complete non-hover experience.

### Buttons
- **Shape:** gently technical corners (0.45rem), never generic pill buttons except the navigation contact control.
- **Primary:** cyan with deep navy text and at least 3.35rem height.
- **Signal:** cyan with deep navy text, reserved for the closing project CTA.
- **Hover / Focus:** translate upward by 3px on hover; retain a 3px cyan focus-visible outline with 4px offset.
- **Quiet:** transparent navy surface with a one-pixel structural border.

### Chips
- **Style:** compact technology labels use a transparent or inherited surface, a one-pixel border, pill radius, and factual text only.
- **State:** chips are descriptive, not interactive filters; they never depend on hover.

### Cards / Containers
- **Corner Style:** media surfaces use the large 1.6rem radius; evidence rows remain mostly square and structural.
- **Background:** alternate deep navy, electric-blue, and ice fields to create rhythm and context.
- **Shadow Strategy:** none; refer to the flat-by-default rule.
- **Border:** one-pixel lines separate timelines, service routes, and navigation.
- **Internal Padding:** fluid spacing from 1.5rem to 5rem according to density and viewport.

### Navigation
- Desktop navigation keeps only Work, Services, About, Contact, and locale switching. CV and agent resources remain discoverable in the footer, while the operational status rail uses a quiet raised navy field.
- At 72rem and below navigation becomes a native button-controlled two-row map; at 48rem it becomes two columns with 44px minimum targets and the status rail is hidden.
- The active route is visible through a cyan underline and `aria-current`, never color alone.

### Case Artifacts
- Authored SVGs turn verified delivery facts into typographic records instead of simulated product screenshots or generic flow diagrams.
- Each artifact has its own composition while preserving the navy, ice, cyan, and electric-blue visual language.

## Do's and Don'ts

### Do:
- **Do** use real screenshots or authored system diagrams to explain a project.
- **Do** preserve at least 16px body text, 44px targets, strong focus, semantic headings, and reduced-motion parity.
- **Do** adapt long bilingual copy through reflow, wrapping, and fluid type rather than clipping.
- **Do** connect every service promise to verifiable experience and a direct contact path.
- **Do** keep electric blue committed and cyan operational according to the named rules.

### Don't:
- **Don't** make a cheap copy of Ruben Marcus's black, green, terminal-inspired portfolio.
- **Don't** use generic AI tool marketing with neon gradients, glass panels, vague claims, and empty futuristic decoration.
- **Don't** use editorial-magazine styling with display serifs, tiny mono labels, and ornamental rules.
- **Don't** use repeated identical card grids and framework-logo walls without evidence or context.
- **Don't** revive the legacy Simplefolio layout, generic developer slogans, or unclear calls to action.
- **Don't** present fictional concepts as delivered work, or publish inflated metrics, implied client endorsements, or keyword stuffing.
