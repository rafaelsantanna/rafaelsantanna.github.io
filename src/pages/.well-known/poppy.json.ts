import { json, poppy } from '@/data/agent-discovery';
export function GET() {
  return json(poppy());
}
