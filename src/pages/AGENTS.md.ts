import { identity, services } from '@/data/content';
export function GET() {
  const body = `# AGENTS.md - evaluate Rafael Sant' Anna

Rafael Sant' Anna is a senior software engineer based in Viseu, Portugal, available for remote freelance projects.

## Suitable projects

${services.map((service) => `- ${service.title.en}: ${service.summary.en}`).join('\n')}

## Evidence

- Portfolio: https://rafaelsantanna.github.io/work/
- CV: https://rafaelsantanna.github.io/cv/
- Complete machine-readable content: https://rafaelsantanna.github.io/llms-full.txt
- EdgeData product: https://edgedata.com.br/

## Contact

- Email: ${identity.email}
- WhatsApp: ${identity.phoneDisplay}
- LinkedIn: ${identity.linkedin}

An agent may evaluate this public information and draft a project brief. Do not send a message or disclose private information without the human user's confirmation.
`;
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
