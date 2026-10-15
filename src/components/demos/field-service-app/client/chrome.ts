import type { Strings } from '../content/strings';
import { countByStatus, retryCountdown, unsyncedCount } from '../lib/queue';
import { esc, fill, plural, type Formatters } from '../lib/text';
import type { View } from '../lib/types';
import type { ViewContext } from '../views/common';
import { icon } from '../views/icons';
import { legendOrder, legendStrip } from '../views/legend';

const FLASH_MS = 2600;

/** Everything around the current screen: status bar, banner, tab bar, and the demo panel. */
export function createChrome(root: HTMLElement, s: Strings, f: Formatters) {
  const app = root.querySelector<HTMLElement>('[data-app]')!;
  const banner = app.querySelector<HTMLElement>('[data-banner]')!;
  const clock = app.querySelector<HTMLElement>('[data-clock]');
  const net = app.querySelector<HTMLElement>('[data-net]');
  const tabs = [...app.querySelectorAll<HTMLButtonElement>('[data-tabs] [data-tab]')];
  const badge = app.querySelector<HTMLElement>('[data-badge]');
  const badgeLabel = app.querySelector<HTMLElement>('[data-badge-sr]');
  const toggle = root.querySelector<HTMLButtonElement>('[data-control="connection"]');
  const toggleText = root.querySelector<HTMLElement>('[data-conn-text]');
  const strip = root.querySelector<HTMLElement>('[data-legend-strip]');
  let flashUntil = 0;
  let flashTimer: number | undefined;
  let last: { ctx: ViewContext; view: View } | null = null;

  function renderBanner(ctx: ViewContext) {
    const pending = unsyncedCount(ctx.state.events);
    const retryIn = ctx.state.online && ctx.now !== null ? retryCountdown(ctx.state.events, ctx.now) : null;
    let tone = '';
    let html = '';
    if (!ctx.state.online) {
      tone = 'offline';
      html = `${icon('cloudOff')}<span class="t-banner__text">${esc(plural(s.banner.offline, pending))}</span>`;
    } else if (retryIn !== null) {
      tone = 'retry';
      html = `${icon('alert')}<span class="t-banner__text">${esc(fill(s.banner.retry, { s: retryIn }))}</span>`;
    } else if (pending > 0 && ctx.drain.total >= 2) {
      tone = 'sending';
      const current = Math.min(ctx.drain.done + 1, ctx.drain.total);
      html = `${icon('sync', 't-spin')}<span class="t-banner__text">${esc(fill(s.banner.sending, { done: current, total: ctx.drain.total }))}</span><span class="t-banner__bar" aria-hidden="true"><span style="inline-size: ${Math.round((ctx.drain.done / ctx.drain.total) * 100)}%"></span></span>`;
    } else if (Date.now() < flashUntil) {
      tone = 'synced';
      html = `${icon('cloudCheck')}<span class="t-banner__text">${esc(s.banner.synced)}</span>`;
    }
    banner.hidden = !tone;
    banner.dataset.tone = tone;
    if (banner.innerHTML !== html) banner.innerHTML = html;
  }

  function renderTabs(ctx: ViewContext, view: View) {
    const active = view.screen === 'order' ? 'today' : view.screen;
    for (const tab of tabs) {
      if (tab.dataset.tab === active) tab.setAttribute('aria-current', 'page');
      else tab.removeAttribute('aria-current');
    }
    const pending = unsyncedCount(ctx.state.events);
    if (badge) {
      badge.hidden = pending === 0;
      badge.textContent = pending > 99 ? '99+' : String(pending);
    }
    if (badgeLabel) badgeLabel.textContent = pending ? `, ${plural(s.tabs.badge, pending)}` : '';
  }

  function renderPanel(ctx: ViewContext) {
    const online = ctx.state.online;
    toggle?.setAttribute('aria-checked', String(online));
    if (toggleText) toggleText.textContent = online ? s.stage.online : s.stage.offline;
    const counts = countByStatus(ctx.state.events);
    for (const status of legendOrder) {
      const cell = root.querySelector<HTMLElement>(`[data-legend-count="${status}"]`);
      if (cell) cell.textContent = String(counts[status]);
    }
    if (strip) {
      const html = legendStrip(s, ctx.state.events);
      if (strip.innerHTML !== html) strip.innerHTML = html;
    }
  }

  function renderNetwork(online: boolean) {
    if (!net) return;
    const html = online ? `${icon('signal')}<span class="t-statusbar__net">4G</span>` : `${icon('signal', 't-statusbar__off')}<span class="t-statusbar__net">${icon('close')}</span>`;
    if (net.innerHTML !== html) net.innerHTML = html;
  }

  return {
    update(ctx: ViewContext, view: View) {
      last = { ctx, view };
      root.dataset.online = String(ctx.state.online);
      app.dataset.screen = view.screen;
      renderBanner(ctx);
      renderTabs(ctx, view);
      renderPanel(ctx);
      renderNetwork(ctx.state.online);
    },
    tick(now: number) {
      if (clock) clock.textContent = f.time(now);
    },
    /** Briefly confirms that a reconnection run finished. */
    flashSynced() {
      flashUntil = Date.now() + FLASH_MS;
      window.clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => {
        if (last) renderBanner(last.ctx);
      }, FLASH_MS + 20);
    },
    clearFlash() {
      flashUntil = 0;
    },
  };
}
