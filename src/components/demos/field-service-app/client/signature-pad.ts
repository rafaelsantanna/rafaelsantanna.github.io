import type { Stroke } from '../lib/types';

/**
 * Strokes live in a virtual space 1000 units wide with the same scale on both axes,
 * so a signature keeps its proportions when the pad changes size.
 */
const SPACE = 1000;
/** Minimum ink, in virtual units, before a signature can be confirmed. */
export const MIN_INK = 160;

function fitCanvas(canvas: HTMLCanvasElement): number {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(canvas.clientWidth * ratio));
  const height = Math.max(1, Math.round(canvas.clientHeight * ratio));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  return ratio;
}

function trace(ctx: CanvasRenderingContext2D, stroke: Stroke, map: (x: number, y: number) => [number, number]) {
  if (stroke.length < 2) return;
  const [x0, y0] = map(stroke[0], stroke[1]);
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  if (stroke.length === 2) {
    ctx.lineTo(x0 + 0.1, y0);
  } else {
    for (let i = 2; i < stroke.length - 2; i += 2) {
      const [x, y] = map(stroke[i], stroke[i + 1]);
      const [nx, ny] = map(stroke[i + 2], stroke[i + 3]);
      ctx.quadraticCurveTo(x, y, (x + nx) / 2, (y + ny) / 2);
    }
    const [lx, ly] = map(stroke[stroke.length - 2], stroke[stroke.length - 1]);
    ctx.lineTo(lx, ly);
  }
  ctx.stroke();
}

function prepare(canvas: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; ratio: number } | null {
  const ratio = fitCanvas(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = getComputedStyle(canvas).color;
  ctx.lineWidth = 2.6 * ratio;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  return { ctx, ratio };
}

/** Draws strokes centered and scaled to fit, for read-only views of a stored signature. */
export function drawSignature(canvas: HTMLCanvasElement, strokes: Stroke[]): void {
  const prepared = prepare(canvas);
  if (!prepared) return;
  const points = strokes.flat();
  if (!points.length) return;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    minX = Math.min(minX, points[i]);
    maxX = Math.max(maxX, points[i]);
    minY = Math.min(minY, points[i + 1]);
    maxY = Math.max(maxY, points[i + 1]);
  }
  const pad = 14 * prepared.ratio;
  const scale = Math.min((canvas.width - pad * 2) / Math.max(1, maxX - minX), (canvas.height - pad * 2) / Math.max(1, maxY - minY));
  const offsetX = (canvas.width - (maxX - minX) * scale) / 2;
  const offsetY = (canvas.height - (maxY - minY) * scale) / 2;
  for (const stroke of strokes) trace(prepared.ctx, stroke, (x, y) => [offsetX + (x - minX) * scale, offsetY + (y - minY) * scale]);
}

export function inkLength(strokes: Stroke[]): number {
  let total = 0;
  for (const stroke of strokes) {
    for (let i = 2; i < stroke.length; i += 2) total += Math.hypot(stroke[i] - stroke[i - 2], stroke[i + 1] - stroke[i - 1]);
  }
  return total;
}

export interface SignaturePad {
  clear(): void;
  destroy(): void;
}

/** Pointer-driven signature capture. Works with touch, pen, and mouse; `onChange` runs after each stroke. */
export function attachSignaturePad(canvas: HTMLCanvasElement, initial: Stroke[], onChange: (strokes: Stroke[]) => void): SignaturePad {
  let strokes: Stroke[] = initial.map((stroke) => [...stroke]);
  let current: Stroke | null = null;
  let frame = 0;

  const toSpace = (event: PointerEvent): [number, number] => {
    const rect = canvas.getBoundingClientRect();
    const scale = SPACE / rect.width;
    return [Math.round((event.clientX - rect.left) * scale), Math.round((event.clientY - rect.top) * scale)];
  };

  const redraw = () => {
    frame = 0;
    const prepared = prepare(canvas);
    if (!prepared) return;
    const scale = canvas.width / SPACE;
    for (const stroke of strokes) trace(prepared.ctx, stroke, (x, y) => [x * scale, y * scale]);
  };

  const requestRedraw = () => {
    if (!frame) frame = window.requestAnimationFrame(redraw);
  };

  const onDown = (event: PointerEvent) => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    canvas.setPointerCapture(event.pointerId);
    current = [...toSpace(event)];
    strokes.push(current);
    requestRedraw();
  };

  const onMove = (event: PointerEvent) => {
    if (!current) return;
    const samples = typeof event.getCoalescedEvents === 'function' ? event.getCoalescedEvents() : [event];
    for (const sample of samples.length ? samples : [event]) {
      const [x, y] = toSpace(sample);
      const lastX = current[current.length - 2];
      const lastY = current[current.length - 1];
      if (Math.hypot(x - lastX, y - lastY) >= 3) current.push(x, y);
    }
    requestRedraw();
  };

  const onUp = () => {
    if (!current) return;
    current = null;
    onChange(strokes);
  };

  const resize = new ResizeObserver(requestRedraw);
  resize.observe(canvas);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  redraw();

  return {
    clear() {
      strokes = [];
      current = null;
      redraw();
      onChange(strokes);
    },
    destroy() {
      resize.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
    },
  };
}
