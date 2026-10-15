import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { projects, services } from './src/data/content.ts';

const legacyCases = ['edgedata', 'academic-operations', 'corporate-learning', 'trinks', 'enterprise-operations'];
const legacyLandingPages = ['pousada-boutique', 'climatizacao-local'];
const pageRoutes = [
  '',
  'work',
  'services',
  'about',
  'cv',
  'contact',
  'for-agents',
  ...projects.flatMap((item) => [`work/${item.slug}`, `demos/${item.slug}`]),
  ...services.map((service) => `services/${service.slug}`),
];

// Portuguese moved from /pt/ to the root, and earlier versions published case studies and landing pages
// under other routes. Keep every previously published link working.
const redirects = Object.fromEntries([
  ...pageRoutes.map((route) => [route ? `/pt/${route}` : '/pt', route ? `/${route}/` : '/']),
  ...['', '/pt'].flatMap((prefix) => [
    ...legacyCases.map((slug) => [`${prefix}/work/${slug}`, '/about/']),
    ...legacyLandingPages.map((slug) => [`${prefix}/work/landing-pages/${slug}`, `/demos/${slug}/`]),
  ]),
]);

export default defineConfig({
  site: 'https://rafaelsantanna.github.io',
  output: 'static',
  trailingSlash: 'always',
  redirects,
  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'pt',
        locales: {
          pt: 'pt-BR',
          en: 'en',
        },
      },
    }),
  ],
});
