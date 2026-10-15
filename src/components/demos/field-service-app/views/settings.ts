import { esc } from '../lib/text';
import type { ViewContext } from './common';
import { icon } from './icons';
import { lastSyncedAt } from './queue';

/** Device facts; patched in place when the connection or the queue changes. */
export function settingsRows(ctx: ViewContext, storedBytes: number | null): string {
  const last = lastSyncedAt(ctx.state.events);
  const row = (label: string, value: string) => `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
  return [
    row(ctx.s.settings.version, ctx.s.settings.versionValue),
    row(ctx.s.settings.connection, ctx.state.online ? ctx.s.stage.online : ctx.s.stage.offline),
    row(ctx.s.settings.lastSync, last ? ctx.f.time(last) : ctx.s.settings.never),
    storedBytes === null ? '' : row(ctx.s.settings.storage, ctx.f.bytes(storedBytes)),
  ].join('');
}

export function renderSettings(ctx: ViewContext, storedBytes: number | null): string {
  const tech = ctx.s.technician;
  return `<section class="t-screen t-screen--settings" data-screen="settings" aria-labelledby="t-screen-title">
    <header class="t-head">
      <div class="t-head__text"><h2 class="t-title" id="t-screen-title" tabindex="-1">${esc(ctx.s.settings.title)}</h2></div>
    </header>
    <div class="t-screen__body">
      <h3 class="t-subhead">${esc(ctx.s.settings.profileTitle)}</h3>
      <div class="t-profile">
        <span class="t-avatar" aria-hidden="true">${esc(tech.initials)}</span>
        <div class="t-profile__text">
          <p class="t-profile__name">${esc(tech.name)}</p>
          <p>${esc(tech.role)} · ${esc(tech.badge)}</p>
          <p>${esc(tech.team)}</p>
        </div>
      </div>
      <p class="t-fine">${icon('info')}<span>${esc(ctx.s.settings.providerNote)}</span></p>
      <h3 class="t-subhead">${esc(ctx.s.settings.deviceTitle)}</h3>
      <dl class="t-rows" data-settings-rows>${settingsRows(ctx, storedBytes)}</dl>
      <div class="t-danger">
        <button type="button" class="t-btn t-btn--danger t-btn--block" data-action="wipe" data-key="wipe" aria-describedby="t-wipe-hint">${icon('trash')}${esc(ctx.s.settings.wipe)}</button>
        <p class="t-item__help" id="t-wipe-hint">${esc(ctx.s.settings.wipeHint)}</p>
      </div>
      <p class="t-fine">${icon('lock')}<span>${esc(ctx.s.settings.demoNote)}</span></p>
    </div>
  </section>`;
}
