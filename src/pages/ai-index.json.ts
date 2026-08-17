import { cases, concepts, identity, services } from '@/data/content';
export function GET() {
  return new Response(JSON.stringify({
    schemaVersion: 1,
    name: identity.name,
    role: identity.role.en,
    summary: identity.summary.en,
    location: identity.location,
    availability: identity.availability.en,
    languages: ['en', 'pt-BR'],
    canonical: 'https://rafaelsantanna.github.io/',
    llms: 'https://rafaelsantanna.github.io/llms.txt',
    fullContent: 'https://rafaelsantanna.github.io/llms-full.txt',
    services: services.map((service) => ({ name: service.title.en, url: `https://rafaelsantanna.github.io/services/${service.slug}/` })),
    work: cases.map((item) => ({ name: item.title, url: `https://rafaelsantanna.github.io/work/${item.slug}/` })),
    showcases: concepts.map((item) => ({ name: item.title.en, url: `https://rafaelsantanna.github.io/work/landing-pages/${item.slug}/`, disclosure: item.disclaimer.en })),
    contact: { email: identity.email, whatsapp: `https://wa.me/${identity.phoneE164}` },
    protocols: { mcp: false, a2a: false, bookingApi: false },
  }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
