import { skillMarkdown } from '@/data/agent-discovery';
export function GET() {
  return new Response(skillMarkdown(), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
