import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { concepts, experience, previewImage, projects, services } from '../src/data/content.ts';
import { homeFaq } from '../src/data/faq.ts';

const dist = resolve('dist');
assert.ok(existsSync(dist), 'dist directory does not exist');

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function targetFor(pathname) {
  const clean = pathname.split(/[?#]/, 1)[0].replace(/^\//, '');
  if (!clean) return join(dist, 'index.html');
  if (/\.[a-z0-9]+$/i.test(clean)) return join(dist, clean);
  return join(dist, clean, 'index.html');
}

const read = (...parts) => readFileSync(join(dist, ...parts), 'utf8');
// Report only the message on failure; printing whole HTML documents makes failures unreadable.
const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
const has = (text, pattern, message) => assert.ok(pattern.test(text), message);
const lacks = (text, pattern, message) => {
  const found = text.match(pattern);
  assert.ok(!found, found ? `${message}: ${found[0].slice(0, 160)}` : message);
};
const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
const isRedirect = (html) => html.startsWith('<!doctype html><title>Redirecting to:');
const redirects = htmlFiles.filter((file) => isRedirect(readFileSync(file, 'utf8')));
const notFound = join(dist, '404.html');
const pages = htmlFiles.filter((file) => !redirects.includes(file) && file !== notFound);

assert.ok(existsSync(notFound), 'Missing 404 page');
{
  const html = readFileSync(notFound, 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, 'Expected one h1 in the 404 page');
  has(html, /<meta name="robots" content="noindex, follow"/, 'The 404 page must not be indexed');
  for (const match of html.matchAll(/href="(\/[^"#]*)/g)) {
    assert.ok(existsSync(targetFor(match[1])), `Broken internal link ${match[1]} in the 404 page`);
  }
}
const pagesPerLocale = 7 + projects.length * 2 + services.length;

assert.equal(pages.length, pagesPerLocale * 2, `Expected ${pagesPerLocale * 2} HTML pages, found ${pages.length}`);
// One redirect per former /pt/ page plus the legacy case-study and landing-page routes.
const expectedRedirects = pagesPerLocale + 14;
assert.equal(redirects.length, expectedRedirects, `Expected ${expectedRedirects} legacy redirects, found ${redirects.length}`);

for (const file of redirects) {
  const target = readFileSync(file, 'utf8').match(/url=([^"]+)"/)?.[1];
  assert.ok(target && existsSync(targetFor(target)), `Redirect in ${file} points to a missing page`);
}

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `Expected one h1 in ${file}`);
  has(html, /<link rel="canonical" href="https:\/\/rafaelsantanna\.github\.io\//, `Missing canonical in ${file}`);
  has(html, /hreflang="pt-BR"/, `Missing pt-BR hreflang in ${file}`);
  has(html, /hreflang="en"/, `Missing en hreflang in ${file}`);
  has(html, /type="text\/markdown"/, `Missing Markdown alternate in ${file}`);
  has(html, /application\/ld\+json/, `Missing JSON-LD in ${file}`);
  has(html, /"@type":"WebPage"/, `Missing WebPage schema in ${file}`);
  has(html, /hreflang="x-default"/, `Missing x-default hreflang in ${file}`);
  has(html, /property="og:image" content="https:\/\/rafaelsantanna\.github\.io\/images\/[^"\s]+"/, `Missing Open Graph image in ${file}`);
  has(html, /property="og:image:alt" content="[^"\s][^"]*"/, `Missing Open Graph image alt in ${file}`);
  has(html, /name="twitter:image:alt" content="[^"\s][^"]*"/, `Missing Twitter image alt in ${file}`);
  lacks(html, /href=""/, `Empty href in ${file}`);
  lacks(html, /<img(?![^>]*\salt(?:=|[\s>]))[^>]*>/, `Image missing alt in ${file}`);
  lacks(html, /\[TODO\]|Unknown Developer|if I'm not mistaken/i, `Legacy or placeholder copy in ${file}`);
  lacks(html, /—/u, `Em dash in ${file}`);
  lacks(html, /href="[^"]*\/work\/landing-pages\//, `Legacy landing-page link in ${file}`);
  for (const match of html.matchAll(/(?:src|href|srcset)="(\/(?:images|fonts|cv)\/[^"?#\s]+)/g)) {
    assert.ok(existsSync(join(dist, match[1].slice(1))), `Missing referenced asset ${match[1]} in ${file}`);
  }
  for (const match of html.matchAll(/href="(\/[^"#]*)/g)) {
    assert.ok(existsSync(targetFor(match[1])), `Broken internal link ${match[1]} in ${file}`);
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)) {
    assert.doesNotThrow(() => JSON.parse(match[1]), `Invalid JSON-LD in ${file}`);
  }
  if (!/[/\\]dist[/\\](?:en[/\\])?index\.html$/.test(file)) {
    has(html, /"@type":"BreadcrumbList"/, `Missing breadcrumb schema in ${file}`);
  }
}

for (const required of ['robots.txt', 'llms.txt', 'llms-full.txt', 'AGENTS.md', 'ai-index.json', 'sitemap.xml', 'sitemap-index.xml', '.well-known/agent-skills/index.json', '.well-known/agent-skills/rafael-santanna-portfolio/SKILL.md', '.well-known/ai-catalog.json', '.well-known/ard.json', '.well-known/api-catalog', '.well-known/poppy.json']) {
  assert.ok(existsSync(join(dist, required)), `Missing generated file: ${required}`);
}

for (const cv of ['rafael-sant-anna-cv.pdf', 'rafael-sant-anna-cv-english.pdf']) {
  assert.ok(existsSync(join(dist, 'cv', cv)), `Missing CV: ${cv}`);
}
assert.match(read('en', 'cv', 'index.html'), /rafael-sant-anna-cv-english\.pdf/, 'English CV page must link to the English PDF');
assert.match(read('cv', 'index.html'), /rafael-sant-anna-cv\.pdf/, 'Portuguese CV page must link to the Portuguese PDF');
assert.match(read('index.html'), /<html lang="pt-BR"/, 'The root page must be the Portuguese version');

const markdownFiles = files.filter((file) => file.includes(`${join('markdown', '')}`) && file.endsWith('.md'));
assert.equal(markdownFiles.length, pagesPerLocale * 2, `Expected ${pagesPerLocale * 2} Markdown alternatives, found ${markdownFiles.length}`);

const robots = read('robots.txt');
has(robots, /OAI-SearchBot/);
has(robots, /User-agent: GPTBot\nDisallow: \//);
has(robots, /^Content-Signal: ai-train=no, search=yes, ai-input=yes$/m);

const sitemap = read('sitemap.xml');
assert.equal((sitemap.match(/<url>/g) || []).length, pagesPerLocale * 2, `Expected ${pagesPerLocale * 2} direct sitemap URLs`);

const aiIndex = JSON.parse(read('ai-index.json'));
assert.equal(aiIndex.protocols.mcp, false);
assert.equal(aiIndex.services.length, services.length);
assert.equal(aiIndex.work.length, projects.length);
assert.equal(aiIndex.experience.length, experience.length);
assert.ok(aiIndex.work.every((item) => item.disclosure && item.demo), 'Every project in ai-index.json needs a disclosure and a demo URL');

for (const locale of ['en', 'pt']) {
  const prefix = locale === 'en' ? 'en' : '';
  const otherPrefix = locale === 'en' ? '' : '/en';
  const home = read(prefix, 'index.html');
  const work = read(prefix, 'work', 'index.html');
  // FAQ schema is allowed only for questions and answers that are visible on the page.
  assert.ok(home.includes('"@type":"FAQPage"'), `${locale} home must publish its FAQ schema`);
  for (const item of homeFaq[locale]) {
    assert.ok(home.includes(`<summary>${item.question}</summary>`) && home.includes(`<p>${item.answer}</p>`), `${locale} home FAQ schema must match a visible question: ${item.question}`);
  }
  for (const item of projects) {
    const localPrefix = locale === 'en' ? '/en' : '';
    assert.ok(home.includes(`href="${localPrefix}/work/${item.slug}/"`) || home.includes(`href="${localPrefix}/demos/${item.slug}/"`), `${locale} home must link to ${item.slug}`);
    assert.ok(work.includes(`href="${localPrefix}/work/${item.slug}/"`), `${locale} work page must link to ${item.slug}`);

    const project = read(prefix, 'work', item.slug, 'index.html');
    assert.ok(project.includes(`property="og:image" content="https://rafaelsantanna.github.io${previewImage(item, locale)}"`), `Project ${locale}/${item.slug} must use its own Open Graph image`);
    assert.ok(project.includes(`property="og:image:alt" content="${escapeAttribute(item.preview.alt[locale])}"`), `Project ${locale}/${item.slug} must use localized Open Graph alt text`);
    assert.ok(project.includes(item.disclaimer[locale].replaceAll("'", '&#39;')) || project.includes(item.disclaimer[locale]), `Project ${locale}/${item.slug} must show its disclosure`);
    assert.ok(project.includes(`href="${localPrefix}/demos/${item.slug}/"`), `Project ${locale}/${item.slug} must link to its live demo`);

    const demo = read(prefix, 'demos', item.slug, 'index.html');
    assert.ok(demo.includes(item.disclaimer[locale].replaceAll("'", '&#39;')) || demo.includes(item.disclaimer[locale]), `Demo ${locale}/${item.slug} must show its disclosure`);
    lacks(demo, /class="brand__light">santanna/, `Demo ${locale}/${item.slug} must not use portfolio chrome`);
    lacks(demo, /<form(?:\s|>)/, `Demo ${locale}/${item.slug} must not offer a native submission path`);
    lacks(demo, /"@type":"(?:LocalBusiness|Review|AggregateRating)"/, `Demo ${locale}/${item.slug} must not publish fictional business schema or reviews`);
    assert.ok(demo.includes(`href="${otherPrefix}/demos/${item.slug}/"`), `Demo ${locale}/${item.slug} must offer a localized language switch`);
    assert.ok(demo.includes(locale === 'pt' ? 'Fale com Rafael' : 'Contact Rafael'), `Demo ${locale}/${item.slug} must offer a path to Rafael`);
    if (!concepts.some((concept) => concept.slug === item.slug)) {
      assert.ok(demo.includes('data-demo-bar'), `Demo ${locale}/${item.slug} must render the shared disclosure bar`);
      assert.ok(demo.includes(`href="${localPrefix}/work/${item.slug}/"`), `Demo ${locale}/${item.slug} must link to its project page`);
    }
  }
}

for (const locale of ['en', 'pt']) {
  const prefix = locale === 'en' ? 'en' : '';
  for (const concept of concepts) {
    const html = read(prefix, 'demos', concept.slug, 'index.html');
    assert.ok(html.includes(concept.demoName[locale]), `Landing demo ${locale}/${concept.slug} must show its audience-facing brand`);
    for (const section of concept.sections[locale]) {
      assert.ok(html.includes(section.title) && html.includes(section.text), `Landing demo ${locale}/${concept.slug} must render its machine-readable content`);
    }
    assert.ok(html.includes('data-demo-planner'), `Landing demo ${locale}/${concept.slug} must include its local interaction`);
    assert.ok(html.includes('type="button" data-demo-update'), `Landing demo ${locale}/${concept.slug} must not submit its local planner`);
    assert.ok(html.includes('aria-live="polite"'), `Landing demo ${locale}/${concept.slug} must announce local interaction results`);
    const boundary = concept.theme === 'hospitality'
      ? (locale === 'pt' ? 'Não consulta disponibilidade nem envia informações' : 'does not check availability or send information')
      : (locale === 'pt' ? 'não calcula capacidade, não verifica agenda e não envia seus dados' : 'does not size equipment, check a schedule, or send your details');
    assert.ok(html.includes(boundary), `Landing demo ${locale}/${concept.slug} must explain the demo boundary`);
    const sectionIds = concept.theme === 'hospitality'
      ? ['casa-inicio', 'casa-estadia', 'casa-arredores', 'casa-planejar']
      : ['clima-inicio', 'clima-servicos', 'clima-processo', 'clima-pedido'];
    for (const id of sectionIds) assert.ok(html.includes(`id="${id}"`), `Landing demo ${locale}/${concept.slug} must include its ${id} section`);
  }
}

for (const removed of ['lms-lxp-learning']) {
  assert.ok(!existsSync(join(dist, 'services', removed, 'index.html')), 'Removed LMS service route must not be generated');
  assert.ok(!existsSync(join(dist, 'en', 'services', removed, 'index.html')), 'Removed English LMS service route must not be generated');
}
assert.ok(!existsSync(join(dist, 'work', 'concepts')), 'Legacy concept routes must not be generated');

console.log(`Distribution validation passed: ${pages.length} HTML pages, ${redirects.length} legacy redirects, ${markdownFiles.length} Markdown alternatives, machine files present.`);
