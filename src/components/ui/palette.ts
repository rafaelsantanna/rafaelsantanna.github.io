import type { DemoProject } from '@/data/types';

/** Exposes a project's palette as CSS custom properties for tinted stages and windows. */
export function paletteStyle(palette: DemoProject['palette']): string {
  return `--p-base:${palette.base};--p-ink:${palette.ink};--p-accent:${palette.accent}`;
}
