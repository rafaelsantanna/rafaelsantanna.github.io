import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { concepts, experience, previewImage, projects, selectedWork, services } from '../src/data/content.ts';
import { machineRoutes } from '../src/data/machine.ts';

const locales = ['en', 'pt'];
const forbidden = [/\[TODO\]/i, /Unknown Developer/i, /if I'm not mistaken/i, /—/u];
const kinds = new Set(['product', 'ai', 'site', 'mobile']);
const hex = /^#[0-9a-f]{6}$/i;

assert.deepEqual(projects.map((item) => item.slug), [
  'logistics-control',
  'legacy-modernization',
  'knowledge-assistant',
  'online-booking',
  'field-service-app',
  'pousada-boutique',
  'climatizacao-local',
], 'Projects must keep the intended presentation order');
assert.equal(experience.length, 6, 'Expected six experience entries (five past roles and the current one)');
assert.equal(experience.filter((item) => item.current).length, 1, 'Expected exactly one current role');
assert.ok(experience[0].current, 'The current role must come first');
assert.equal(concepts.length, 2, 'Expected the two original landing-page demonstrations');
assert.equal(selectedWork.length, 2, 'Expected only two additional high-impact projects');
assert.deepEqual(services.map((service) => service.slug), [
  'b2b-saas-internal-systems',
  'websites-landing-pages',
  'frontend-modernization',
  'ai-automation-rag',
  'mobile-integrations',
], 'Services must preserve the intended commercial hierarchy');
assert.ok(!services.some((service) => service.slug === 'lms-lxp-learning'), 'LMS must remain experience, not a service');
assert.ok(experience.some((item) => item.slug === 'corporate-learning'), 'Corporate learning experience must remain published');
assert.ok(selectedWork.every((item) => item.title !== 'SOS Bolsas de Estudo Online'), 'Removed project must not return');
assert.deepEqual(concepts.map((item) => item.theme), ['hospitality', 'service'], 'Landing demos must keep distinct art directions');

for (const collection of [projects, services, experience, concepts]) {
  assert.equal(new Set(collection.map((item) => item.slug)).size, collection.length, 'Slugs must be unique');
}

for (const item of projects) {
  assert.match(item.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid project slug: ${item.slug}`);
  assert.ok(item.name.trim(), `Missing name for ${item.slug}`);
  assert.ok(kinds.has(item.kind), `Invalid kind for ${item.slug}`);
  assert.ok(['desktop', 'mobile'].includes(item.device), `Invalid device for ${item.slug}`);
  for (const key of ['base', 'ink', 'accent']) assert.match(item.palette[key], hex, `Invalid palette.${key} for ${item.slug}`);
  for (const locale of locales) {
    const image = previewImage(item, locale);
    for (const suffix of ['.png', '.webp', '-800.webp', '-1200.webp']) {
      assert.ok(existsSync(resolve(`public${image.replace(/\.png$/, suffix)}`)), `Missing ${locale} ${suffix} preview for ${item.slug}`);
    }
  }
  assert.ok(item.preview.width > 0 && item.preview.height > 0, `Invalid preview dimensions for ${item.slug}`);
  assert.ok(item.stack.length >= 3, `Expected at least three technologies for ${item.slug}`);
  assert.ok(item.services.length >= 1, `Project ${item.slug} needs a related service`);
  for (const slug of item.services) assert.ok(services.some((service) => service.slug === slug), `Unknown service ${slug} in ${item.slug}`);
  for (const locale of locales) {
    for (const key of ['category', 'tagline', 'summary', 'problem', 'approach', 'boundary', 'disclaimer']) {
      assert.ok(item[key][locale]?.trim(), `Missing ${key}.${locale} for ${item.slug}`);
    }
    assert.ok(item.preview.alt[locale]?.trim(), `Missing preview alt.${locale} for ${item.slug}`);
    assert.ok(item.highlights[locale].length >= 4, `Expected at least four highlights for ${item.slug}.${locale}`);
    assert.ok(item.decisions[locale].length >= 3, `Expected at least three decisions for ${item.slug}.${locale}`);
    for (const entry of [...item.highlights[locale], ...item.decisions[locale]]) {
      assert.ok(entry.title.trim() && entry.text.trim(), `Incomplete highlight or decision in ${item.slug}.${locale}`);
    }
    assert.match(item.disclaimer[locale], locale === 'pt'
      ? /demonstração autoral.*Rafael Sant' Anna.*marca e dados fictícios/i
      : /demo built by Rafael Sant' Anna.*brand and data are fictional/i, `Disclosure missing for ${item.slug}.${locale}`);
  }
  assert.equal(item.highlights.en.length, item.highlights.pt.length, `Highlights must match across locales for ${item.slug}`);
  assert.equal(item.decisions.en.length, item.decisions.pt.length, `Decisions must match across locales for ${item.slug}`);
}

for (const service of services) {
  assert.match(service.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `Invalid service slug: ${service.slug}`);
  assert.ok(service.projects.length >= 1, `Service ${service.slug} needs a related project`);
  for (const slug of service.projects) assert.ok(projects.some((item) => item.slug === slug), `Unknown project ${slug} in ${service.slug}`);
  for (const locale of locales) {
    assert.ok(service.title[locale]?.trim(), `Missing title.${locale} for ${service.slug}`);
    assert.ok(service.summary[locale]?.trim(), `Missing summary.${locale} for ${service.slug}`);
    assert.ok(service.idealFor[locale].length >= 3, `Expected idealFor.${locale} for ${service.slug}`);
    assert.ok(service.deliverables[locale].length >= 3, `Expected deliverables.${locale} for ${service.slug}`);
  }
}
for (const item of projects) {
  assert.ok(services.some((service) => service.projects.includes(item.slug)), `Project ${item.slug} must illustrate at least one service`);
}

for (const item of experience) {
  assert.ok(item.company.trim(), `Missing company for ${item.slug}`);
  if (item.externalUrl) assert.doesNotThrow(() => new URL(item.externalUrl), `Invalid external URL for ${item.slug}`);
  for (const locale of locales) {
    for (const key of ['title', 'eyebrow', 'summary', 'role', 'period']) {
      assert.ok(item[key][locale]?.trim(), `Missing ${key}.${locale} for ${item.slug}`);
    }
    // A current role only states what is public; past roles keep their full CV-backed story.
    if (item.current) continue;
    for (const key of ['context', 'challenge', 'solution']) {
      assert.ok(item[key]?.[locale]?.trim(), `Missing ${key}.${locale} for ${item.slug}`);
    }
    assert.ok(item.outcomes[locale].length >= 2, `Expected at least two outcomes for ${item.slug}.${locale}`);
  }
}

for (const concept of concepts) {
  assert.ok(existsSync(resolve(`public${concept.image}`)), `Missing concept image: ${concept.image}`);
  assert.ok(existsSync(resolve(`public${concept.image.replace(/\.png$/, '.webp')}`)), `Missing optimized concept image: ${concept.image}`);
  for (const locale of locales) {
    assert.ok(concept.sections[locale].length === 3, `Expected three sections for ${concept.slug}.${locale}`);
    assert.ok(concept.sections[locale].every((section) => section.title.trim() && section.text.trim()), `Incomplete demo content for ${concept.slug}.${locale}`);
  }
}

const routes = machineRoutes();
const perLocale = 7 + projects.length * 2 + services.length;
assert.equal(routes.length, perLocale * 2, `Expected ${perLocale} Markdown routes per locale`);
assert.equal(new Set(routes.map((route) => `${route.locale}/${route.slug}`)).size, routes.length, 'Machine routes must be unique');
for (const route of routes) {
  assert.ok(route.markdown.includes(`# ${route.title}`) || route.slug === 'index', `Missing heading in ${route.locale}/${route.slug}`);
  assert.ok(route.markdown.includes('url: https://'), `Missing canonical URL in ${route.locale}/${route.slug}`);
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}
const sourceFiles = walk(resolve('src')).filter((file) => /\.(astro|ts|css|mjs)$/.test(file));
for (const file of sourceFiles) {
  const source = readFileSync(file, 'utf8');
  for (const pattern of forbidden) assert.doesNotMatch(source, pattern, `Forbidden content pattern ${pattern} in ${file}`);
}

console.log(`Content validation passed: ${projects.length} projects, ${services.length} services, ${experience.length} experience entries, ${routes.length} Markdown routes, ${sourceFiles.length} source files checked.`);
