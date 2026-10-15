# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-08-10] Preserve the published portfolio until replacement is verified**
   Do instead: build and validate the Astro output locally before committing or publishing.
2. **[2026-08-10] Animation must be progressive enhancement**
   Do instead: scope hidden reveal states under the root `.js` class so static HTML stays visible without JavaScript.

## Shell & Command Reliability
1. **[2026-08-10] Use native PowerShell for Windows file operations**
   Do instead: resolve exact paths first and use `Copy-Item` or `Remove-Item -LiteralPath` end to end.

## Domain Behavior Guardrails
1. **[2026-10-15] Real client work cannot be shown; prove skill with honest demos**
   Do instead: showcase the authorial demos (fictional brands and data, visible disclosure, nothing sent), keep real experience as CV-backed text in About and CV, and never present a demo as delivered client work.
2. **[2026-10-15] Social previews follow page evidence**
   Do instead: use each project's real demo screenshot (`/images/projects/<slug>.png`) and localized alt on project and demo routes; use the raster social card elsewhere.

## User Directives
1. **[2026-10-09] Keep the portfolio personal and visually expressive**
   Do instead: use the dark "Showroom" direction described in `DESIGN.md`, the user's original portrait (no new photo wanted) and real demo screenshots, with purposeful native motion. Chris and Ruben are quality references, not templates to copy; the cobalt slab from the first redesign was rejected.
2. **[2026-08-10] Impeccable is mandatory from design through final QA**
   Do instead: maintain PRODUCT.md and DESIGN.md, then run responsive, accessibility, critique, audit, and polish passes.
3. **[2026-10-15] Portuguese (pt-BR) is the primary language**
   Do instead: serve pt-BR at the root, mirror English under `/en/`, keep `/pt/` redirects, and emit canonical, hreflang and x-default (pt) metadata.
4. **[2026-08-16] LMS is experience, not a current service**
   Do instead: preserve the Revvo experience in About and CV, but keep LMS out of service routes and current positioning; AI appears through the Bússola demo, whose retrieval runs locally and says so.
