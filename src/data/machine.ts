import { cases, copy, identity, localize, selectedWork, services, type Locale } from './content.ts';

export interface MachineRoute {
  locale: Locale;
  slug: string;
  title: string;
  markdown: string;
}

function frontmatter(title: string, description: string, locale: Locale, url: string) {
  return `---\ntitle: "${title.replaceAll('"', '\\"')}"\ndescription: "${description.replaceAll('"', '\\"')}"\nlang: ${locale === 'pt' ? 'pt-BR' : 'en'}\nurl: ${url}\n---\n`;
}

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join('\n');
}

export function machineRoutes(): MachineRoute[] {
  const routes: MachineRoute[] = [];
  for (const locale of ['en', 'pt'] as const) {
    const t = copy[locale];
    const root = `https://rafaelsantanna.github.io${locale === 'pt' ? '/pt' : ''}`;
    const cvUrl = `https://rafaelsantanna.github.io/cv/rafael-sant-anna-cv${locale === 'pt' ? '' : '-english'}.pdf`;
    routes.push({
      locale,
      slug: 'index',
      title: `${identity.name} - ${identity.role[locale]}`,
      markdown: `${frontmatter(`${identity.name} - ${identity.role[locale]}`, identity.summary[locale], locale, `${root}/`)}\n# ${identity.name} - ${identity.role[locale]}\n\n${identity.summary[locale]}\n\n## Availability\n\n${identity.availability[locale]}. ${identity.location}.\n\n## Services\n\n${list(services.map((service) => `[${localize(service.title, locale)}](${root}/services/${service.slug}/): ${localize(service.summary, locale)}`))}\n\n## Selected work\n\n${list(cases.map((item) => `[${item.title}](${root}/work/${item.slug}/): ${localize(item.summary, locale)}`))}\n\n## Contact\n\n- Email: ${identity.email}\n- WhatsApp: ${identity.phoneDisplay}\n- LinkedIn: ${identity.linkedin}\n- GitHub: ${identity.github}\n`,
    });
    routes.push({
      locale,
      slug: 'work',
      title: t.workTitle,
      markdown: `${frontmatter(t.workTitle, t.workIntro, locale, `${root}/work/`)}\n# ${t.workTitle}\n\n${t.workIntro}\n\n${cases.map((item) => `## ${item.title}\n\n${localize(item.summary, locale)}\n\n- ${localize(item.role, locale)}\n- ${localize(item.period, locale)}\n- [${t.viewCase}](${root}/work/${item.slug}/)`).join('\n\n')}\n`,
    });
    routes.push({
      locale,
      slug: 'services',
      title: t.servicesPageTitle,
      markdown: `${frontmatter(t.servicesPageTitle, identity.summary[locale], locale, `${root}/services/`)}\n# ${t.servicesPageTitle}\n\n${identity.summary[locale]}\n\n${services.map((service) => `## ${localize(service.title, locale)}\n\n${localize(service.summary, locale)}\n\n[${t.viewService}](${root}/services/${service.slug}/)`).join('\n\n')}\n`,
    });
    routes.push({ locale, slug: 'about', title: t.aboutTitle, markdown: `${frontmatter(t.aboutTitle, identity.summary[locale], locale, `${root}/about/`)}\n# ${t.aboutTitle}\n\n${identity.summary[locale]}\n\n## Focus\n\n${locale === 'pt' ? 'Produtos B2B, sistemas internos, modernização de plataformas, integrações, mobile e automação aplicada com IA.' : 'B2B products, internal systems, platform modernization, integrations, mobile, and applied AI automation.'}\n` });
    routes.push({ locale, slug: 'cv', title: t.cvTitle, markdown: `${frontmatter(t.cvTitle, identity.summary[locale], locale, `${root}/cv/`)}\n# ${t.cvTitle}\n\n${identity.summary[locale]}\n\n## Core skills\n\n- Frontend: React, React Native, Vue.js, AngularJS, TypeScript\n- Backend: Node.js, Laravel, PHP, .NET/C#, REST APIs\n- Data: PostgreSQL, MySQL, SQL Server\n- Automation: RAG, AI assistants, Telegram and WhatsApp bots\n\n[${t.downloadCv}](${cvUrl})\n` });
    routes.push({ locale, slug: 'contact', title: t.contactTitle, markdown: `${frontmatter(t.contactTitle, identity.summary[locale], locale, `${root}/contact/`)}\n# ${t.contactTitle}\n\n${identity.availability[locale]}.\n\n- Email: mailto:${identity.email}\n- WhatsApp: https://wa.me/${identity.phoneE164}\n- LinkedIn: ${identity.linkedin}\n` });
    routes.push({ locale, slug: 'for-agents', title: t.agentTitle, markdown: `${frontmatter(t.agentTitle, t.agentIntro, locale, `${root}/for-agents/`)}\n# ${t.agentTitle}\n\n${t.agentIntro}\n\n## Evaluation facts\n\n- Name: ${identity.name}\n- Role: ${identity.role[locale]}\n- Based: ${identity.location}\n- Experience: 10+ years\n- Availability: ${identity.availability[locale]}\n\n## Safety\n\n${locale === 'pt' ? 'Agentes podem avaliar informações e preparar um briefing. O envio de mensagens deve permanecer sob confirmação humana.' : 'Agents may evaluate information and prepare a brief. Sending messages should remain under human confirmation.'}\n` });

    for (const item of cases) {
      const description = localize(item.summary, locale);
      routes.push({
        locale,
        slug: `work/${item.slug}`,
        title: item.title,
        markdown: `${frontmatter(item.title, description, locale, `${root}/work/${item.slug}/`)}\n# ${item.title}\n\n${description}\n\n- Role: ${localize(item.role, locale)}\n- Period: ${localize(item.period, locale)}\n\n## ${t.context}\n\n${localize(item.context, locale)}\n\n## ${t.challenge}\n\n${localize(item.challenge, locale)}\n\n## ${t.solution}\n\n${localize(item.solution, locale)}\n\n## ${t.outcomes}\n\n${list(item.outcomes[locale])}\n\n## ${t.technologies}\n\n${list(item.technologies)}\n`,
      });
    }
    for (const service of services) {
      const title = localize(service.title, locale);
      const description = localize(service.summary, locale);
      routes.push({
        locale,
        slug: `services/${service.slug}`,
        title,
        markdown: `${frontmatter(title, description, locale, `${root}/services/${service.slug}/`)}\n# ${title}\n\n${description}\n\n## ${t.fit}\n\n${list(service.idealFor[locale])}\n\n## ${t.deliverables}\n\n${list(service.deliverables[locale])}\n\n## ${t.technologies}\n\n${list(service.technologies)}\n`,
      });
    }
  }
  return routes;
}

export function llmsIndex() {
  return `# ${identity.name}: Senior Software Engineer\n\n> ${identity.summary.en}\n> ${identity.availability.en}.\n\n## Main sections\n\n- [Home](https://rafaelsantanna.github.io/): Positioning, proof, services, and contact.\n- [Work](https://rafaelsantanna.github.io/work/): Five detailed, verifiable case studies.\n- [Services](https://rafaelsantanna.github.io/services/): B2B systems, platform modernization, applied AI automation, and mobile integrations.\n- [About](https://rafaelsantanna.github.io/about/): Professional background and project context.\n- [CV](https://rafaelsantanna.github.io/cv/): Human-readable curriculum and PDF download.\n- [For agents](https://rafaelsantanna.github.io/for-agents/): Evaluation facts and machine-readable resources.\n- [Português](https://rafaelsantanna.github.io/pt/): Complete pt-BR version.\n\n## Selected work\n\n${list(cases.map((item) => `[${item.title}](https://rafaelsantanna.github.io/work/${item.slug}/): ${item.summary.en}`))}\n\n## Services\n\n${list(services.map((service) => `[${service.title.en}](https://rafaelsantanna.github.io/services/${service.slug}/): ${service.summary.en}`))}\n\n## Contact\n\n- Email: ${identity.email}\n- WhatsApp: ${identity.phoneDisplay}\n- LinkedIn: ${identity.linkedin}\n- GitHub: ${identity.github}\n`;
}

export function llmsFull() {
  return `# ${identity.name} - Complete portfolio content\n\n${machineRoutes().filter((route) => route.locale === 'en').map((route) => `${route.markdown}\n\n---`).join('\n\n')}\n\n## Additional selected work\n\n${selectedWork.map((item) => `### ${item.title}\n\n${item.description.en}\n\nTechnology: ${item.technologies.join(', ')}`).join('\n\n')}\n`;
}
