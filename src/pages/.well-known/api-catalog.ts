import { apiCatalog, json } from '@/data/agent-discovery';
export function GET() {
  return json(apiCatalog(), 'application/linkset+json');
}
