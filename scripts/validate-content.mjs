import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cases, services } from '../src/data/content.ts';
import { machineRoutes } from '../src/data/machine.ts';

const locales = ['en', 'pt'];
const forbidden = [/\[TODO\]/i, /Unknown Developer/i, /if I'm not mistaken/i, /—/u];

assert.equal(cases.length, 5, 'Expected exactly five launch case studies');
assert.equal(services.length, 5, 'Expected exactly five launch services');
assert.equal(new Set(cases.map((item) => item.slug)).size, cases.length, 'Case slugs must be unique');
assert.equal(new Set(services.map((item) => item.slug)).size, services.length, 'Service slugs must be unique');

for (const item of cases) {
  assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid case slug: ${item.slug}`);
  assert.ok(existsSync(resolve(`public${item.image}`)), `Missing case image: ${item.image}`);
  assert.ok(item.imageWidth > 0 && item.imageHeight > 0, `Invalid image dimensions for ${item.slug}`);
  if (item.externalUrl) assert.doesNotThrow(() => new URL(item.externalUrl), `Invalid external URL for ${item.slug}`);
  for (const locale of locales) {
    for (const key of ['eyebrow', 'summary', 'role', 'period', 'context', 'challenge', 'solution', 'imageAlt']) {
      assert.ok(item[key][locale]?.trim(), `Missing ${key}.${locale} for ${item.slug}`);
    }
    assert.ok(item.outcomes[locale].length >= 2, `Expected at least two outcomes for ${item.slug}.${locale}`);
  }
}

for (const service of services) {
  assert.match(service.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid service slug: ${service.slug}`);
  assert.ok(service.evidence.length >= 1, `Service ${service.slug} needs evidence`);
  for (const evidence of service.evidence) assert.ok(cases.some((item) => item.slug === evidence), `Unknown evidence ${evidence}`);
  for (const locale of locales) {
    assert.ok(service.title[locale]?.trim(), `Missing title.${locale} for ${service.slug}`);
    assert.ok(service.summary[locale]?.trim(), `Missing summary.${locale} for ${service.slug}`);
    assert.ok(service.idealFor[locale].length >= 3, `Expected idealFor.${locale} for ${service.slug}`);
    assert.ok(service.deliverables[locale].length >= 3, `Expected deliverables.${locale} for ${service.slug}`);
  }
}

const routes = machineRoutes();
assert.equal(routes.length, 34, 'Expected 17 Markdown routes per locale');
assert.equal(new Set(routes.map((route) => `${route.locale}/${route.slug}`)).size, routes.length, 'Machine routes must be unique');
for (const route of routes) {
  assert.ok(route.markdown.includes(`# ${route.title}`) || route.slug === 'index', `Missing heading in ${route.locale}/${route.slug}`);
  assert.ok(route.markdown.includes('url: https://'), `Missing canonical URL in ${route.locale}/${route.slug}`);
}

const source = readFileSync(resolve('src/data/content.ts'), 'utf8');
for (const pattern of forbidden) assert.doesNotMatch(source, pattern, `Forbidden content pattern: ${pattern}`);

console.log(`Content validation passed: ${cases.length} cases, ${services.length} services, ${routes.length} Markdown routes.`);
