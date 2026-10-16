import { aiCatalog, json } from '@/data/agent-discovery';
export function GET() {
  return json(aiCatalog());
}
