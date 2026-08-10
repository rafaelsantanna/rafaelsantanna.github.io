---
name: Rafael Sant' Anna Portfolio
description: An operational atlas for a senior engineer who builds the software behind complex operations.
colors:
  mineral-paper: "oklch(95.5% 0.018 84)"
  mineral-paper-strong: "oklch(90.5% 0.034 82)"
  mineral-paper-soft: "oklch(98% 0.01 84)"
  charcoal-ink: "oklch(21% 0.045 254)"
  charcoal-ink-soft: "oklch(38% 0.045 252)"
  muted-coordinate: "oklch(49% 0.035 250)"
  committed-cobalt: "oklch(51% 0.22 260)"
  cobalt-deep: "oklch(35% 0.17 259)"
  signal-orange: "oklch(70% 0.19 48)"
  on-color: "oklch(97% 0.012 84)"
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
    backgroundColor: "{colors.committed-cobalt}"
    textColor: "{colors.on-color}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.78rem 1.1rem"
    height: "3.35rem"
  button-signal:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.charcoal-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0.78rem 1.1rem"
    height: "3.35rem"
  technology-chip:
    backgroundColor: "{colors.mineral-paper}"
    textColor: "{colors.charcoal-ink}"
    rounded: "{rounded.pill}"
    padding: "0.35rem 0.7rem"
---

# Design System: Rafael Sant' Anna Portfolio

## Overview

**Creative North Star: "The Systems Atlas"**

The interface feels like a precise operational map opened on a bright desk: routes, coordinates, annotations, and project evidence form a coherent working surface. It is mechanical, warm, and decisive. Asymmetry creates energy, while repeated alignments, labeled stages, and generous reading rhythm keep complex material legible.

The system is static-first and progressively enhanced. Motion reveals relationships without controlling comprehension; the same hierarchy remains intact with JavaScript disabled, reduced motion enabled, long Portuguese copy, or a 320px viewport. It explicitly rejects terminal cosplay, generic AI marketing, editorial-magazine styling, and template-like card grids.

**Key Characteristics:**
- Asymmetric maps and flows explain relationships instead of decorating empty space.
- Cobalt fields establish identity; orange marks actions and operational waypoints.
- Alternating evidence rows replace interchangeable card grids.
- Semantic structure serves people, search engines, and agents from the same source.
- Responsive composition reflows deliberately at 72rem, 60rem, 48rem, and 23rem.

## Colors

Warm mineral neutrals make the portfolio feel human and usable during a working day. Blue-charcoal carries reading contrast, committed cobalt owns the brand, and signal orange is deliberately scarce.

### Primary
- **Committed Cobalt:** the large brand surface for service fields, case alternation, primary buttons, system maps, and active navigation.
- **Cobalt Deep:** the interaction state for primary actions and the darkest route field.

### Secondary
- **Signal Orange:** the action and waypoint color for availability, selected nodes, and the closing CTA. It never becomes ambient decoration.

### Neutral
- **Mineral Paper:** the default canvas and light card surface.
- **Mineral Paper Strong:** the warmer separating field for selected sections.
- **Mineral Paper Soft:** the lightest foreground surface inside cobalt diagrams.
- **Charcoal Ink:** all primary copy and structural strokes.
- **Charcoal Ink Soft:** long-form supporting copy.
- **Muted Coordinate:** metadata, dates, and secondary annotations.

**The Committed Cobalt Rule.** Cobalt must carry the identity across major moments; never reduce it to a tiny generic accent.

**The Signal Rule.** Orange marks an action, status, or turning point. If it cannot be explained operationally, remove it.

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

The system uses no resting shadows. Depth comes from cobalt and mineral tonal fields, alternating composition, borders, overlap, and responsive movement. Interactive elements move by at most 3px; focus is expressed with a visible orange outline rather than a glow.

**The Flat-by-Default Rule.** Surfaces remain flat at rest. If a component needs a permanent shadow to separate from its background, the tonal hierarchy is wrong.

## Components

Components are tactile and confident, with meaningful states and a complete non-hover experience.

### Buttons
- **Shape:** gently technical corners (0.45rem), never generic pill buttons except the navigation contact control.
- **Primary:** committed cobalt with light mineral text and at least 3.35rem height.
- **Signal:** orange with charcoal text, reserved for the closing project CTA.
- **Hover / Focus:** translate upward by 3px on hover; retain a 3px orange focus-visible outline with 4px offset.
- **Quiet:** transparent mineral surface with a one-pixel structural border.

### Chips
- **Style:** compact technology labels use a transparent or inherited surface, a one-pixel border, pill radius, and factual text only.
- **State:** chips are descriptive, not interactive filters; they never depend on hover.

### Cards / Containers
- **Corner Style:** media surfaces use the large 1.6rem radius; evidence rows remain mostly square and structural.
- **Background:** alternate mineral and cobalt fields to create rhythm and context.
- **Shadow Strategy:** none; refer to the flat-by-default rule.
- **Border:** one-pixel lines separate timelines, service routes, and navigation.
- **Internal Padding:** fluid spacing from 1.5rem to 5rem according to density and viewport.

### Navigation
- Desktop navigation is a compact horizontal route with an outlined contact destination and cobalt locale switch.
- At 72rem and below it becomes a native button-controlled two-row map; at 48rem it becomes two columns with 44px minimum targets.
- The active route is visible through a cobalt underline and `aria-current`, never color alone.

### System Maps
- Connected SVG nodes use a cobalt field, mineral surfaces, orange waypoints, and explicit captions.
- Diagram motion draws existing routes only; reduced motion shows the complete map immediately.

## Do's and Don'ts

### Do:
- **Do** use real screenshots or authored system diagrams to explain a project.
- **Do** preserve at least 16px body text, 44px targets, strong focus, semantic headings, and reduced-motion parity.
- **Do** adapt long bilingual copy through reflow, wrapping, and fluid type rather than clipping.
- **Do** connect every service promise to verifiable experience and a direct contact path.
- **Do** keep cobalt committed and orange scarce according to the named rules.

### Don't:
- **Don't** make a cheap copy of Ruben Marcus's black, green, terminal-inspired portfolio.
- **Don't** use generic AI tool marketing with neon gradients, glass panels, vague claims, and empty futuristic decoration.
- **Don't** use editorial-magazine styling with display serifs, tiny mono labels, and ornamental rules.
- **Don't** use repeated identical card grids and framework-logo walls without evidence or context.
- **Don't** revive the legacy Simplefolio layout, generic developer slogans, or unclear calls to action.
- **Don't** publish fictional projects, inflated metrics, implied client endorsements, or keyword stuffing.
