import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const dist = resolve('dist');
assert.ok(existsSync(dist), 'dist directory does not exist');

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith('.html'));
assert.equal(htmlFiles.length, 34, `Expected 34 HTML pages, found ${htmlFiles.length}`);

function targetFor(pathname) {
  const clean = pathname.split(/[?#]/, 1)[0].replace(/^\//, '');
  if (!clean) return join(dist, 'index.html');
  if (/\.[a-z0-9]+$/i.test(clean)) return join(dist, clean);
  return join(dist, clean, 'index.html');
}

for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `Expected one h1 in ${file}`);
  assert.match(html, /<link rel="canonical" href="https:\/\/rafaelsantanna\.github\.io\//, `Missing canonical in ${file}`);
  assert.match(html, /hreflang="(?:en|pt-BR)"/, `Missing hreflang in ${file}`);
  assert.match(html, /type="text\/markdown"/, `Missing Markdown alternate in ${file}`);
  assert.match(html, /application\/ld\+json/, `Missing JSON-LD in ${file}`);
  assert.match(html, /"@type":"WebPage"/, `Missing WebPage schema in ${file}`);
  assert.match(html, /hreflang="x-default"/, `Missing x-default hreflang in ${file}`);
  assert.match(html, /property="og:image" content="https:\/\/rafaelsantanna\.github\.io\/images\/social-card\.png"/, `Missing raster Open Graph image in ${file}`);
  assert.doesNotMatch(html, /href=""/, `Empty href in ${file}`);
  assert.doesNotMatch(html, /<img(?![^>]*\salt=)[^>]*>/, `Image missing alt in ${file}`);
  assert.doesNotMatch(html, /\[TODO\]|Unknown Developer|if I'm not mistaken/i, `Legacy or placeholder copy in ${file}`);
  for (const match of html.matchAll(/(?:src|href)="(\/(?:images|fonts|cv)\/[^"?#]+)"/g)) {
    assert.ok(existsSync(join(dist, match[1].slice(1))), `Missing referenced asset ${match[1]} in ${file}`);
  }
  for (const match of html.matchAll(/href="(\/[^"#]*)/g)) {
    assert.ok(existsSync(targetFor(match[1])), `Broken internal link ${match[1]} in ${file}`);
  }
  for (const match of html.matchAll(/<script type="application\/ld\+json">([^<]+)<\/script>/g)) {
    assert.doesNotThrow(() => JSON.parse(match[1]), `Invalid JSON-LD in ${file}`);
  }
  if (!/[/\\]dist[/\\](?:pt[/\\])?index\.html$/.test(file)) {
    assert.match(html, /"@type":"BreadcrumbList"/, `Missing breadcrumb schema in ${file}`);
  }
}

for (const required of ['robots.txt', 'llms.txt', 'llms-full.txt', 'AGENTS.md', 'ai-index.json', 'sitemap.xml', 'sitemap-index.xml']) {
  assert.ok(existsSync(join(dist, required)), `Missing generated file: ${required}`);
}

for (const cv of ['rafael-sant-anna-cv.pdf', 'rafael-sant-anna-cv-english.pdf']) {
  assert.ok(existsSync(join(dist, 'cv', cv)), `Missing CV: ${cv}`);
}

assert.match(readFileSync(join(dist, 'cv', 'index.html'), 'utf8'), /rafael-sant-anna-cv-english\.pdf/, 'English CV page must link to the English PDF');
assert.match(readFileSync(join(dist, 'pt', 'cv', 'index.html'), 'utf8'), /rafael-sant-anna-cv\.pdf/, 'Portuguese CV page must link to the Portuguese PDF');

const markdownFiles = files.filter((file) => file.includes(`${join('markdown', '')}`) && file.endsWith('.md'));
assert.equal(markdownFiles.length, 34, `Expected 34 Markdown alternatives, found ${markdownFiles.length}`);

const robots = readFileSync(join(dist, 'robots.txt'), 'utf8');
assert.match(robots, /OAI-SearchBot/);
assert.match(robots, /User-agent: GPTBot\nDisallow: \//);
assert.match(robots, /^Content-Signal: ai-train=no, search=yes, ai-input=yes$/m);

const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
assert.equal((sitemap.match(/<url>/g) || []).length, 34, 'Expected 34 direct sitemap URLs');

const aiIndex = JSON.parse(readFileSync(join(dist, 'ai-index.json'), 'utf8'));
assert.equal(aiIndex.protocols.mcp, false);
assert.equal(aiIndex.services.length, 5);
assert.equal(aiIndex.work.length, 5);

console.log(`Distribution validation passed: ${htmlFiles.length} HTML pages, ${markdownFiles.length} Markdown alternatives, machine files present.`);
