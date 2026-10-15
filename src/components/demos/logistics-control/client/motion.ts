/**
 * Moves vehicle markers along their route loops with requestAnimationFrame.
 * Runs only while the map is on screen, the tab is visible, the overview is active,
 * motion is not paused by the user and the system does not ask for reduced motion.
 */
import type { RouteGeometry } from '../lib/routes';
import { vehicleTransform } from '../render/map';

export function createMotion(svg: SVGSVGElement, onReducedChange: (reduced: boolean) => void) {
  const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let routes: RouteGeometry[] = [];
  const offsets = new Map<string, number>();
  let vehicles = new Map<string, SVGGElement>();
  let visible = false;
  let paused = false;
  let active = true;
  let frame = 0;
  let last = 0;

  const speedOf = (index: number) => 11 + ((index * 7) % 9);

  function place() {
    routes.forEach((route) => vehicles.get(route.driverId)?.setAttribute('transform', vehicleTransform(route, offsets.get(route.driverId) ?? route.start)));
  }

  function step(time: number) {
    const elapsed = last ? Math.min(64, time - last) / 1000 : 0;
    last = time;
    routes.forEach((route, index) => {
      if (!route.path.total) return;
      offsets.set(route.driverId, ((offsets.get(route.driverId) ?? route.start) + speedOf(index) * elapsed) % route.path.total);
    });
    place();
    frame = window.requestAnimationFrame(step);
  }

  function update() {
    const shouldRun = visible && active && !paused && !reducedQuery.matches && !document.hidden;
    if (shouldRun && !frame) {
      last = 0;
      frame = window.requestAnimationFrame(step);
    } else if (!shouldRun && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  }

  new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    update();
  }).observe(svg);
  document.addEventListener('visibilitychange', update);
  reducedQuery.addEventListener('change', () => {
    onReducedChange(reducedQuery.matches);
    update();
  });

  return {
    /** Swaps geometry after data changes, keeping each vehicle at the same share of its loop. */
    setRoutes(next: RouteGeometry[]) {
      const previous = new Map(routes.map((route) => [route.driverId, route]));
      next.forEach((route) => {
        const old = previous.get(route.driverId);
        const offset = offsets.get(route.driverId);
        const share = old && old.path.total && offset !== undefined ? offset / old.path.total : null;
        offsets.set(route.driverId, share === null ? route.start : share * route.path.total);
      });
      routes = next;
      vehicles = new Map([...svg.querySelectorAll<SVGGElement>('.lc-vehicle')].map((element) => [element.dataset.driver ?? '', element]));
      place();
    },
    setPaused(value: boolean) {
      paused = value;
      update();
    },
    setActive(value: boolean) {
      active = value;
      update();
    },
    reduced: () => reducedQuery.matches,
  };
}
