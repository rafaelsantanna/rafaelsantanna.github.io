import { experience, identity, projects, services } from '@/data/content';
export function GET() {
  return new Response(JSON.stringify({
    schemaVersion: 1,
    name: identity.name,
    role: identity.role.en,
    summary: identity.summary.en,
    location: identity.location,
    availability: identity.availability.en,
    languages: ['pt-BR', 'en'],
    english: 'https://rafaelsantanna.github.io/en/',
    canonical: 'https://rafaelsantanna.github.io/',
    llms: 'https://rafaelsantanna.github.io/llms.txt',
    fullContent: 'https://rafaelsantanna.github.io/llms-full.txt',
    services: services.map((service) => ({ name: service.title.en, url: `https://rafaelsantanna.github.io/en/services/${service.slug}/` })),
    work: projects.map((item) => ({ name: item.name, category: item.category.en, url: `https://rafaelsantanna.github.io/en/work/${item.slug}/`, demo: `https://rafaelsantanna.github.io/en/demos/${item.slug}/`, disclosure: item.disclaimer.en })),
    experience: experience.map((item) => ({ name: item.title.en, company: item.company, period: item.period.en, role: item.role.en })),
    contact: { email: identity.email, whatsapp: `https://wa.me/${identity.phoneE164}` },
    protocols: { mcp: false, a2a: false, bookingApi: false },
  }, null, 2), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
