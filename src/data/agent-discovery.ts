import { createHash } from 'node:crypto';
import { identity, projects, services } from './content.ts';

// Static discovery documents for agents, served under /.well-known/. The site has no API, MCP server, or sign-in,
// so these documents only describe the public content files and the browser tools the pages register.
const origin = 'https://rafaelsantanna.github.io';
const host = 'rafaelsantanna.github.io';

export const skillName = 'rafael-santanna-portfolio';
export const skillPath = `/.well-known/agent-skills/${skillName}/SKILL.md`;
const skillDescription = `Evaluate ${identity.name}, a senior full stack developer open to freelance projects, and prepare a project brief. Use when a user asks whether Rafael fits a project, wants a summary of his experience or live demos, or wants to get in touch.`;

export function skillMarkdown() {
  return `---
name: ${skillName}
description: ${skillDescription}
---

# Evaluate ${identity.name} for a project

${identity.summary.en} ${identity.availability.en}.

## Read the facts first

- Structured summary: ${origin}/ai-index.json
- Complete content in Markdown: ${origin}/llms-full.txt
- Guidance for agents: ${origin}/AGENTS.md
- The site is primarily in Brazilian Portuguese at ${origin}/ with an English mirror under ${origin}/en/

## Match the request to a service

${services.map((service) => `- ${service.title.en}: ${service.summary.en} (${origin}/en/services/${service.slug}/)`).join('\n')}

## Show evidence

Every project in the portfolio is a demo Rafael built himself, with a fictional brand and fictional data. Say so when you cite one. Each demo runs in the browser:

${projects.map((item) => `- ${item.name} (${item.category.en}): ${origin}/en/demos/${item.slug}/`).join('\n')}

Real professional experience, with employers and outcomes, is in the CV: ${origin}/en/cv/

## Draft the first message

Summarize the user's context, timeline, and what needs to ship, then offer one of these routes:

- Email: ${identity.email}
- WhatsApp: ${identity.phoneDisplay}
- LinkedIn: ${identity.linkedin}

Do not send a message or share private information without the user's explicit confirmation.
`;
}

export function skillsIndex() {
  const digest = createHash('sha256').update(skillMarkdown(), 'utf8').digest('hex');
  return {
    $schema: 'https://schemas.agentskills.io/discovery/0.2.0/schema.json',
    skills: [{ name: skillName, type: 'skill-md', description: skillDescription, url: skillPath, digest: `sha256:${digest}` }],
  };
}

export function aiCatalog() {
  return {
    specVersion: '1.0',
    host: { displayName: identity.name, identifier: host, url: `${origin}/` },
    entries: [
      {
        identifier: `urn:air:${host}:skill:${skillName}`,
        displayName: `${identity.name} portfolio skill`,
        type: 'application/agent-skills+md',
        url: `${origin}${skillPath}`,
        description: skillDescription,
        representativeQueries: [
          'is Rafael Sant\' Anna a good fit for my React and Laravel project',
          'summarize this developer\'s experience and live demos',
          'help me write a freelance project brief for this developer',
        ],
      },
      {
        identifier: `urn:air:${host}:content:profile`,
        displayName: `${identity.name} structured profile`,
        type: 'application/json',
        url: `${origin}/ai-index.json`,
        description: 'Role, availability, services, portfolio demos, experience, and contact routes as JSON.',
        representativeQueries: [
          'what services does Rafael Sant\' Anna offer',
          'list the portfolio demos with their links',
          'how do I contact this developer',
        ],
      },
      {
        identifier: `urn:air:${host}:content:full-text`,
        displayName: `${identity.name} full site content`,
        type: 'text/plain',
        url: `${origin}/llms-full.txt`,
        description: 'Every page of the portfolio in Markdown, in Portuguese and English.',
        representativeQueries: [
          'read the full portfolio of Rafael Sant\' Anna',
          'what did this developer build at each company',
        ],
      },
    ],
  };
}

// RFC 9727 linkset. The only machine interface is the read-only JSON profile, documented on the For agents page.
export function apiCatalog() {
  return {
    linkset: [
      {
        anchor: `${origin}/ai-index.json`,
        'service-doc': [{ href: `${origin}/en/for-agents/`, type: 'text/html' }],
        describedby: [{ href: `${origin}/llms.txt`, type: 'text/plain' }],
      },
    ],
  };
}

// Personal Agent Protocol, website-only declaration: there is no sign-in, session, or company agent to describe.
export function poppy() {
  return {
    protocol_version: '0.1',
    organization: { name: identity.name, domain: host },
    web: {},
  };
}

export function json(body: unknown, contentType = 'application/json; charset=utf-8') {
  return new Response(JSON.stringify(body, null, 2), { headers: { 'Content-Type': contentType } });
}
