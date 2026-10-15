export interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Offset {
  x: number;
  y: number;
}

export const ORIGIN: Offset = { x: 0, y: 0 };

/** Pixels a pointer must travel before a press on a title bar becomes a drag. */
export const DRAG_THRESHOLD = 4;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Limits a translation so that an element, whose untranslated box is `base`,
 * stays inside `bounds`. If the element is larger than the bounds it is pinned
 * to the top-left edge.
 */
export function clampOffset(offset: Offset, base: Box, bounds: Box): Offset {
  return {
    x: clamp(offset.x, bounds.left - base.left, bounds.right - base.right),
    y: clamp(offset.y, bounds.top - base.top, bounds.bottom - base.bottom),
  };
}

/** Smallest box that contains both boxes. */
export function union(a: Box, b: Box): Box {
  return {
    left: Math.min(a.left, b.left),
    top: Math.min(a.top, b.top),
    right: Math.max(a.right, b.right),
    bottom: Math.max(a.bottom, b.bottom),
  };
}

/** Returns the untranslated box of an element that is currently moved by `offset`. */
export function untranslate(box: Box, offset: Offset): Box {
  return {
    left: box.left - offset.x,
    top: box.top - offset.y,
    right: box.right - offset.x,
    bottom: box.bottom - offset.y,
  };
}

export function hasMoved(dx: number, dy: number): boolean {
  return Math.hypot(dx, dy) >= DRAG_THRESHOLD;
}
