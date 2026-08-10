import { machineRoutes } from '@/data/machine';

const site = 'https://rafaelsantanna.github.io';

function urlFor(locale: 'en' | 'pt', slug: string) {
  const path = slug === 'index' ? '' : `${slug}/`;
  return `${site}/${locale === 'pt' ? 'pt/' : ''}${path}`;
}

export function GET() {
  const urls = machineRoutes().map((route) => {
    const en = urlFor('en', route.slug);
    const pt = urlFor('pt', route.slug);
    return `<url><loc>${urlFor(route.locale, route.slug)}</loc><xhtml:link rel="alternate" hreflang="en" href="${en}"/><xhtml:link rel="alternate" hreflang="pt-BR" href="${pt}"/><xhtml:link rel="alternate" hreflang="x-default" href="${en}"/></url>`;
  }).join('');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
