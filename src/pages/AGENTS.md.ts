import { identity, services } from '@/data/content';
export function GET() {
  const body = `# AGENTS.md - evaluate Rafael Sant' Anna

${identity.summary.en} ${identity.availability.en}.

## Suitable projects

${services.map((service) => `- ${service.title.en}: ${service.summary.en}`).join('\n')}

## Evidence

- Portfolio projects (demos Rafael built for this portfolio, with fictional brands and data, each with a live demo): https://rafaelsantanna.github.io/en/work/
- The site is primarily in Brazilian Portuguese at https://rafaelsantanna.github.io/ with an English mirror under /en/
- CV: https://rafaelsantanna.github.io/en/cv/
- Complete machine-readable content: https://rafaelsantanna.github.io/llms-full.txt
- EdgeData product: https://edgedata.com.br/

## Discovery

- Agent skill index: https://rafaelsantanna.github.io/.well-known/agent-skills/index.json
- AI catalog (ARD): https://rafaelsantanna.github.io/.well-known/ard.json
- Site pages register read-only WebMCP tools (list projects, list services, contact details, open a page) when the browser supports WebMCP

## Contact

- Email: ${identity.email}
- WhatsApp: ${identity.phoneDisplay}
- LinkedIn: ${identity.linkedin}

An agent may evaluate this public information and draft a project brief. Do not send a message or disclose private information without the human user's confirmation.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
