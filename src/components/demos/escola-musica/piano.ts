// One-octave keyboard (C4 to C5) with a soft synthesized tone. Audio is created on the first user gesture.

const KEY_MAP: Record<string, number> = { a: 0, w: 1, s: 2, e: 3, d: 4, f: 5, t: 6, g: 7, y: 8, h: 9, u: 10, j: 11, k: 12 };
// Opening phrase of Ode to Joy (Beethoven, public domain): [semitone above C4, beats].
const ODE: [number, number][] = [
  [4, 1], [4, 1], [5, 1], [7, 1], [7, 1], [5, 1], [4, 1], [2, 1],
  [0, 1], [0, 1], [2, 1], [4, 1], [4, 1.5], [2, 0.5], [2, 2],
];
const BEAT_MS = 420;
// Staff position (in half line-gaps above E4, the bottom line at y = 60) for each semitone of the octave.
const STAFF_STEP = [-2, -2, -1, -1, 0, 1, 1, 2, 2, 3, 3, 4, 5];
const SHARPS = new Set([1, 3, 6, 8, 10]);
const TRAIL = 9;

let audio: AudioContext | null = null;
let master: GainNode | null = null;

function context(): AudioContext | null {
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audio) {
    audio = new Ctor();
    master = audio.createGain();
    master.gain.value = 0.22;
    const compressor = audio.createDynamicsCompressor();
    master.connect(compressor).connect(audio.destination);
  }
  if (audio.state === 'suspended') void audio.resume();
  return audio;
}

function tone(semitone: number, seconds = 1.6) {
  const ctx = context();
  if (!ctx || !master) return;
  const freq = 261.63 * 2 ** (semitone / 12);
  const now = ctx.currentTime;
  const body = ctx.createOscillator();
  body.type = 'triangle';
  body.frequency.value = freq;
  const shimmer = ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = freq * 2;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = 0.16;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(Math.min(freq * 7, 5200), now);
  filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.6, 420), now + seconds);
  const envelope = ctx.createGain();
  envelope.gain.setValueAtTime(0.0001, now);
  envelope.gain.exponentialRampToValueAtTime(0.9, now + 0.012);
  envelope.gain.exponentialRampToValueAtTime(0.32, now + 0.28);
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + seconds);
  body.connect(filter);
  shimmer.connect(shimmerGain).connect(filter);
  filter.connect(envelope).connect(master);
  body.start(now);
  shimmer.start(now);
  body.stop(now + seconds + 0.05);
  shimmer.stop(now + seconds + 0.05);
}

export function initPiano(root: HTMLElement) {
  const keys = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-note]'));
  const playButton = root.querySelector<HTMLButtonElement>('[data-piano-play]');
  const playLabel = playButton?.querySelector<HTMLElement>('[data-label]');
  const readout = root.querySelector<HTMLElement>('[data-piano-readout]');
  const trail = root.querySelector<SVGGElement>('[data-piano-trail]');
  const names = (root.dataset.names || '').split('|');
  const shortNames = (root.dataset.short || '').split('|');
  const history: number[] = [];
  let timers: number[] = [];

  const keyFor = (semitone: number) => keys.find((key) => Number(key.dataset.note) === semitone);

  function drawTrail() {
    if (!trail) return;
    const svgNs = 'http://www.w3.org/2000/svg';
    trail.replaceChildren();
    history.forEach((semitone, index) => {
      const x = 34 + index * 30;
      const y = 60 - STAFF_STEP[semitone] * 5;
      const group = document.createElementNS(svgNs, 'g');
      group.setAttribute('class', index === history.length - 1 ? 'clave-staff__note is-last' : 'clave-staff__note');
      if (y >= 70) {
        const ledger = document.createElementNS(svgNs, 'line');
        ledger.setAttribute('x1', String(x - 10));
        ledger.setAttribute('x2', String(x + 10));
        ledger.setAttribute('y1', '70');
        ledger.setAttribute('y2', '70');
        group.append(ledger);
      }
      if (SHARPS.has(semitone)) {
        const sharp = document.createElementNS(svgNs, 'text');
        sharp.setAttribute('x', String(x - 15));
        sharp.setAttribute('y', String(y + 4));
        sharp.textContent = '#';
        group.append(sharp);
      }
      const head = document.createElementNS(svgNs, 'ellipse');
      head.setAttribute('cx', String(x));
      head.setAttribute('cy', String(y));
      head.setAttribute('rx', '6.4');
      head.setAttribute('ry', '4.6');
      head.setAttribute('transform', `rotate(-20 ${x} ${y})`);
      group.append(head);
      trail.append(group);
    });
  }

  function strike(semitone: number, holdMs = 220) {
    tone(semitone);
    const key = keyFor(semitone);
    if (key) {
      key.classList.add('is-down');
      window.setTimeout(() => key.classList.remove('is-down'), holdMs);
    }
    history.push(semitone);
    if (history.length > TRAIL) history.shift();
    drawTrail();
    if (readout) readout.textContent = `${root.dataset.now || ''}: ${shortNames[semitone] || names[semitone] || ''}`;
  }

  function stop() {
    timers.forEach((id) => window.clearTimeout(id));
    timers = [];
    playButton?.setAttribute('aria-pressed', 'false');
    if (playLabel) playLabel.textContent = root.dataset.play || '';
  }

  keys.forEach((key) => {
    const semitone = Number(key.dataset.note);
    key.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      strike(semitone);
    });
    // Keyboard activation (Enter or Space) arrives as a click with no pointer detail.
    key.addEventListener('click', (event) => {
      if (event.detail === 0) strike(semitone);
    });
  });

  root.addEventListener('keydown', (event) => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
    const semitone = KEY_MAP[event.key.toLowerCase()];
    if (semitone === undefined) return;
    event.preventDefault();
    strike(semitone, 240);
  });

  playButton?.addEventListener('click', () => {
    if (timers.length) {
      stop();
      return;
    }
    context();
    playButton.setAttribute('aria-pressed', 'true');
    if (playLabel) playLabel.textContent = root.dataset.stop || '';
    let at = 0;
    ODE.forEach(([semitone, beats]) => {
      timers.push(window.setTimeout(() => strike(semitone, beats * BEAT_MS * 0.8), at));
      at += beats * BEAT_MS;
    });
    timers.push(window.setTimeout(stop, at));
  });
}
