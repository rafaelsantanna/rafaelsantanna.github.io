import { copy, experience, identity, localize, projects, selectedWork, services, technologyName, timeline, type DemoProject, type Locale } from './content.ts';

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

function projectTitle(project: DemoProject, locale: Locale) {
  return `${project.name}: ${localize(project.category, locale)}`;
}

function experienceMarkdown(locale: Locale) {
  const t = copy[locale];
  return experience.map((item) => {
    const story = ([[t.context, item.context], [t.challenge, item.challenge], [t.solution, item.solution]] as const)
      .flatMap(([label, text]) => (text ? [`**${label}.** ${localize(text, locale)}`] : []));
    const outcomes = item.outcomes[locale].length ? [list(item.outcomes[locale])] : [];
    const stack = item.technologies.length ? [`${t.technologies}: ${item.technologies.map((name) => technologyName(name, locale)).join(', ')}`] : [];
    const header = `### ${localize(item.title, locale)}\n\n${localize(item.summary, locale)}\n\n- ${localize(item.role, locale)}\n- ${localize(item.period, locale)}`;
    return [header, ...story, ...outcomes, ...stack].join('\n\n');
  }).join('\n\n');
}

export function machineRoutes(): MachineRoute[] {
  const routes: MachineRoute[] = [];
  for (const locale of ['en', 'pt'] as const) {
    const t = copy[locale];
    const pt = locale === 'pt';
    const root = `https://rafaelsantanna.github.io${pt ? '' : '/en'}`;
    const cvUrl = `https://rafaelsantanna.github.io${identity.cv[locale]}`;
    const label = pt
      ? {
          availability: 'Disponibilidade', services: 'Serviços', contact: 'Contato', focus: 'Foco', coreSkills: 'Competências técnicas',
          facts: 'Fatos para avaliação', name: 'Nome', role: 'Papel', based: 'Base', experience: 'Experiência', years: 'mais de 10 anos',
          languages: 'Idiomas do site', languagesValue: 'português do Brasil (principal, em /) e inglês (em /en/)', safety: 'Segurança',
          skills: ['Frontend: React, React Native, Vue.js, AngularJS, TypeScript', 'Backend: Node.js, Laravel, PHP, .NET/C#, APIs REST', 'Dados: PostgreSQL, MySQL, SQL Server', 'Automação: RAG, assistentes de IA, bots para Telegram e WhatsApp'],
        }
      : {
          availability: 'Availability', services: 'Services', contact: 'Contact', focus: 'Focus', coreSkills: 'Core skills',
          facts: 'Evaluation facts', name: 'Name', role: 'Role', based: 'Based', experience: 'Experience', years: '10+ years',
          languages: 'Site languages', languagesValue: 'Brazilian Portuguese (primary, at /) and English (at /en/)', safety: 'Safety',
          skills: ['Frontend: React, React Native, Vue.js, AngularJS, TypeScript', 'Backend: Node.js, Laravel, PHP, .NET/C#, REST APIs', 'Data: PostgreSQL, MySQL, SQL Server', 'Automation: RAG, AI assistants, Telegram and WhatsApp bots'],
        };
    const demoNote = pt
      ? 'Todos os projetos abaixo são demonstrações autorais criadas por Rafael para este portfólio, com marcas e dados fictícios. Cada um pode ser aberto e usado no navegador.'
      : 'Every project below is a demo Rafael built for this portfolio, with fictional brands and data. Each one can be opened and used in the browser.';
    routes.push({
      locale,
      slug: 'index',
      title: `${identity.name} - ${identity.role[locale]}`,
      markdown: `${frontmatter(`${identity.name} - ${identity.role[locale]}`, identity.summary[locale], locale, `${root}/`)}\n# ${identity.name} - ${identity.role[locale]}\n\n${identity.summary[locale]}\n\n## ${label.availability}\n\n${identity.availability[locale]}. ${identity.location}.\n\n## ${t.workTitle}\n\n${demoNote}\n\n${list(projects.map((item) => `[${projectTitle(item, locale)}](${root}/work/${item.slug}/): ${localize(item.summary, locale)}`))}\n\n## ${label.services}\n\n${list(services.map((service) => `[${localize(service.title, locale)}](${root}/services/${service.slug}/): ${localize(service.summary, locale)}`))}\n\n## ${t.experienceTitle}\n\n${list(timeline.map((item) => `${item.period}: ${item.company}, ${item.role[locale]}`))}\n\n## ${label.contact}\n\n- Email: ${identity.email}\n- WhatsApp: ${identity.phoneDisplay}\n- LinkedIn: ${identity.linkedin}\n- GitHub: ${identity.github}\n`,
    });
    routes.push({
      locale,
      slug: 'work',
      title: t.workTitle,
      markdown: `${frontmatter(t.workTitle, t.workIntro, locale, `${root}/work/`)}\n# ${t.workTitle}\n\n${t.workIntro}\n\n> ${demoNote}\n\n${projects.map((item) => `## ${projectTitle(item, locale)}\n\n${localize(item.summary, locale)}\n\n- [${t.viewProject}](${root}/work/${item.slug}/)\n- [${t.openDemo}](${root}/demos/${item.slug}/)`).join('\n\n')}\n`,
    });
    routes.push({
      locale,
      slug: 'services',
      title: t.servicesPageTitle,
      markdown: `${frontmatter(t.servicesPageTitle, identity.summary[locale], locale, `${root}/services/`)}\n# ${t.servicesPageTitle}\n\n${t.servicesPageIntro}\n\n${services.map((service) => `## ${localize(service.title, locale)}\n\n${localize(service.summary, locale)}\n\n[${t.viewService}](${root}/services/${service.slug}/)`).join('\n\n')}\n`,
    });
    routes.push({
      locale,
      slug: 'about',
      title: t.aboutTitle,
      markdown: `${frontmatter(t.aboutTitle, identity.summary[locale], locale, `${root}/about/`)}\n# ${t.aboutTitle}\n\n${t.aboutIntro}\n\n## ${label.focus}\n\n${pt ? 'Produtos B2B, sistemas internos, modernização de plataformas, sites, integrações, mobile e automação aplicada com IA.' : 'B2B products, internal systems, platform modernization, websites, integrations, mobile, and applied AI automation.'}\n\n## ${t.experienceTitle}\n\n${experienceMarkdown(locale)}\n\n## ${pt ? 'Outros projetos' : 'Other projects'}\n\n${list(selectedWork.map((item) => `${item.title}: ${item.description[locale]}`))}\n`,
    });
    routes.push({ locale, slug: 'cv', title: t.cvTitle, markdown: `${frontmatter(t.cvTitle, identity.summary[locale], locale, `${root}/cv/`)}\n# ${t.cvTitle}\n\n${identity.summary[locale]}\n\n## ${label.coreSkills}\n\n${list(label.skills)}\n\n## ${t.experienceTitle}\n\n${experienceMarkdown(locale)}\n\n[${t.downloadCv}](${cvUrl})\n` });
    routes.push({ locale, slug: 'contact', title: t.contactTitle, markdown: `${frontmatter(t.contactTitle, identity.summary[locale], locale, `${root}/contact/`)}\n# ${t.contactTitle}\n\n${identity.availability[locale]}.\n\n- Email: mailto:${identity.email}\n- WhatsApp: https://wa.me/${identity.phoneE164}\n- LinkedIn: ${identity.linkedin}\n` });
    routes.push({ locale, slug: 'for-agents', title: t.agentTitle, markdown: `${frontmatter(t.agentTitle, t.agentIntro, locale, `${root}/for-agents/`)}\n# ${t.agentTitle}\n\n${t.agentIntro}\n\n## ${label.facts}\n\n- ${label.name}: ${identity.name}\n- ${label.role}: ${identity.role[locale]}\n- ${label.based}: ${identity.location}\n- ${label.experience}: ${label.years}\n- ${label.availability}: ${identity.availability[locale]}\n- ${label.languages}: ${label.languagesValue}\n\n## ${pt ? 'Sobre os projetos do portfólio' : 'About the portfolio projects'}\n\n${demoNote}\n\n${list(projects.map((item) => `[${projectTitle(item, locale)}](${root}/work/${item.slug}/): ${localize(item.summary, locale)}`))}\n\n## ${label.safety}\n\n${pt ? 'Agentes podem avaliar informações e preparar um briefing. O envio de mensagens deve permanecer sob confirmação humana.' : 'Agents may evaluate information and prepare a brief. Sending messages should remain under human confirmation.'}\n` });

    for (const item of projects) {
      const title = projectTitle(item, locale);
      const description = `${localize(item.summary, locale)} ${localize(item.disclaimer, locale)}`;
      routes.push({
        locale,
        slug: `work/${item.slug}`,
        title,
        markdown: `${frontmatter(title, description, locale, `${root}/work/${item.slug}/`)}\n# ${title}\n\n> ${localize(item.disclaimer, locale)}\n\n${localize(item.tagline, locale)}\n\n${localize(item.summary, locale)}\n\n## ${pt ? 'O problema' : 'The problem'}\n\n${localize(item.problem, locale)}\n\n## ${pt ? 'O que foi construído' : 'What was built'}\n\n${localize(item.approach, locale)}\n\n## ${pt ? 'O que a demo mostra' : 'What the demo shows'}\n\n${list(item.highlights[locale].map((entry) => `${entry.title}: ${entry.text}`))}\n\n## ${pt ? 'Decisões' : 'Decisions'}\n\n${list(item.decisions[locale].map((entry) => `${entry.title}: ${entry.text}`))}\n\n## ${t.technologies}\n\n${list(item.stack)}\n\n## ${pt ? 'Limites da demonstração' : 'Demonstration boundaries'}\n\n${localize(item.boundary, locale)}\n\n[${t.openDemo}](${root}/demos/${item.slug}/)\n`,
      });
      routes.push({
        locale,
        slug: `demos/${item.slug}`,
        title: `${item.name} (${pt ? 'demo' : 'live demo'})`,
        markdown: `${frontmatter(`${item.name} (${pt ? 'demo' : 'live demo'})`, description, locale, `${root}/demos/${item.slug}/`)}\n# ${item.name} (${pt ? 'demo' : 'live demo'})\n\n> ${localize(item.disclaimer, locale)}\n\n${localize(item.tagline, locale)}\n\n${localize(item.summary, locale)}\n\n${localize(item.boundary, locale)}\n\n[${t.viewProject}](${root}/work/${item.slug}/) · [${pt ? 'Falar com Rafael' : 'Contact Rafael'}](${root}/contact/)\n`,
      });
    }
    for (const service of services) {
      const title = localize(service.title, locale);
      const description = localize(service.summary, locale);
      const related = service.projects.map((slug) => projects.find((item) => item.slug === slug)!);
      routes.push({
        locale,
        slug: `services/${service.slug}`,
        title,
        markdown: `${frontmatter(title, description, locale, `${root}/services/${service.slug}/`)}\n# ${title}\n\n${description}\n\n## ${t.fit}\n\n${list(service.idealFor[locale])}\n\n## ${t.deliverables}\n\n${list(service.deliverables[locale])}\n\n## ${t.evidence}\n\n${list(related.map((item) => `[${projectTitle(item, locale)}](${root}/work/${item.slug}/): ${localize(item.summary, locale)}`))}\n\n## ${t.technologies}\n\n${list(service.technologies.map((name) => technologyName(name, locale)))}\n`,
      });
    }
  }
  return routes;
}

export function llmsIndex() {
  return `# ${identity.name}: Senior Software Engineer\n\n> ${identity.summary.en}\n> ${identity.availability.en}.\n\n## Main sections\n\n- [Home](https://rafaelsantanna.github.io/en/): Positioning, working projects, services, and contact.\n- [Work](https://rafaelsantanna.github.io/en/work/): ${projects.length} demos with fictional brands and data, each with a project page and a live demo.\n- [Services](https://rafaelsantanna.github.io/en/services/): B2B systems, websites and landing pages, modernization, AI automation, and mobile integrations.\n- [About](https://rafaelsantanna.github.io/en/about/): Professional background and experience.\n- [CV](https://rafaelsantanna.github.io/en/cv/): Human-readable curriculum and PDF download.\n- [For agents](https://rafaelsantanna.github.io/en/for-agents/): Evaluation facts and machine-readable resources.\n- [Português](https://rafaelsantanna.github.io/): Primary pt-BR version of the whole site.\n\n## Projects\n\nDemos Rafael built for this portfolio. Brands and data are fictional.\n\n${list(projects.map((item) => `[${item.name}: ${item.category.en}](https://rafaelsantanna.github.io/en/work/${item.slug}/): ${item.summary.en} Live demo: https://rafaelsantanna.github.io/en/demos/${item.slug}/`))}\n\n## Services\n\n${list(services.map((service) => `[${service.title.en}](https://rafaelsantanna.github.io/en/services/${service.slug}/): ${service.summary.en}`))}\n\n## Experience\n\n${list(experience.map((item) => `${item.title.en} (${item.period.en}): ${item.summary.en}`))}\n\n## Contact\n\n- Email: ${identity.email}\n- WhatsApp: ${identity.phoneDisplay}\n- LinkedIn: ${identity.linkedin}\n- GitHub: ${identity.github}\n`;
}

export function llmsFull() {
  return `# ${identity.name} - Complete portfolio content\n\n> Primary language: Brazilian Portuguese at https://rafaelsantanna.github.io/. This file contains the English mirror under /en/.\n\n${machineRoutes().filter((route) => route.locale === 'en' && !route.slug.startsWith('demos/')).map((route) => `${route.markdown}\n\n---`).join('\n\n')}\n`;
}
