export interface PhotoOptions {
  variant: number;
  stamp: string;
  label: string;
}

/** Small deterministic PRNG so a stored variant always redraws the same "photo". */
function random(seed: number): () => number {
  let state = (seed * 2654435761) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws a generated stand-in for a photo of an installed ONT, stamped with the capture time and order. */
export function drawPhoto(canvas: HTMLCanvasElement, options: PhotoOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  const rand = random(options.variant + 7);
  const hue = 205 + rand() * 30;

  const wall = ctx.createLinearGradient(0, 0, 0, h * 0.62);
  wall.addColorStop(0, `hsl(${hue} 16% 80%)`);
  wall.addColorStop(1, `hsl(${hue} 14% 70%)`);
  ctx.fillStyle = wall;
  ctx.fillRect(0, 0, w, h * 0.62);

  const shelf = ctx.createLinearGradient(0, h * 0.62, 0, h);
  shelf.addColorStop(0, 'hsl(32 22% 62%)');
  shelf.addColorStop(1, 'hsl(30 20% 44%)');
  ctx.fillStyle = shelf;
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  ctx.fillStyle = 'rgb(255 255 255 / 0.18)';
  ctx.fillRect(0, h * 0.62, w, 3);

  for (let i = 0; i < 2600; i += 1) {
    ctx.fillStyle = rand() > 0.5 ? 'rgb(255 255 255 / 0.06)' : 'rgb(0 0 0 / 0.06)';
    ctx.fillRect(rand() * w, rand() * h, 1.5, 1.5);
  }

  const cx = w / 2 + (rand() - 0.5) * 60;
  const cy = h * 0.5;
  const boxW = 300;
  const boxH = 120;

  ctx.save();
  ctx.fillStyle = 'rgb(20 24 34 / 0.28)';
  ctx.filter = 'blur(10px)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + boxH / 2 + 8, boxW * 0.55, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#e8b923';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx + boxW / 2 - 10, cy - 10);
  ctx.bezierCurveTo(cx + boxW / 2 + 70, cy - 20, w - 40 - rand() * 40, cy - 140, w + 10, 30 + rand() * 60);
  ctx.stroke();

  ctx.strokeStyle = '#3c4a63';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx - boxW / 2 + 16, cy + 20);
  ctx.bezierCurveTo(cx - boxW / 2 - 60, cy + 40, 60 + rand() * 30, h * 0.75, -10, h * 0.86);
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(((rand() - 0.5) * 5 * Math.PI) / 180);
  ctx.fillStyle = '#c9ced8';
  roundRect(ctx, -boxW / 2, -boxH / 2 + 10, boxW, boxH, 18);
  ctx.fill();
  const body = ctx.createLinearGradient(0, -boxH / 2, 0, boxH / 2);
  body.addColorStop(0, '#fbfcfd');
  body.addColorStop(1, '#e3e7ee');
  ctx.fillStyle = body;
  roundRect(ctx, -boxW / 2, -boxH / 2, boxW, boxH, 18);
  ctx.fill();

  ctx.fillStyle = '#2f6bff';
  ctx.font = '700 20px Geologica, system-ui, sans-serif';
  ctx.fillText('NOVELO', -boxW / 2 + 22, -boxH / 2 + 34);
  ctx.fillStyle = '#5b6478';
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.fillText('ONT NV-210', -boxW / 2 + 22, -boxH / 2 + 54);

  ctx.fillStyle = '#2bab5d';
  ctx.fillRect(boxW / 2 - 4, -24, 16, 26);

  const leds = [
    { label: 'PWR', on: true },
    { label: 'PON', on: true },
    { label: 'LOS', on: false },
    { label: 'LAN', on: true },
    { label: 'WI-FI', on: true },
  ];
  leds.forEach((led, index) => {
    const x = -boxW / 2 + 40 + index * 54;
    const y = boxH / 2 - 34;
    if (led.on) {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 16);
      glow.addColorStop(0, 'rgb(74 222 128 / 0.75)');
      glow.addColorStop(1, 'rgb(74 222 128 / 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = led.on ? '#4ade80' : '#9aa3b2';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#5b6478';
    ctx.font = '600 11px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(led.label, x, y + 22);
    ctx.textAlign = 'start';
  });
  ctx.restore();

  const vignette = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
  vignette.addColorStop(0, 'rgb(0 0 0 / 0)');
  vignette.addColorStop(1, 'rgb(0 0 0 / 0.38)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = 'rgb(14 21 37 / 0.74)';
  ctx.fillRect(0, h - 48, w, 48);
  ctx.fillStyle = '#ffffff';
  ctx.font = '600 18px ui-monospace, "Cascadia Code", Consolas, monospace';
  ctx.textBaseline = 'middle';
  ctx.fillText(options.stamp, 18, h - 24);
  ctx.textAlign = 'right';
  ctx.fillText(options.label, w - 18, h - 24);
  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
}
