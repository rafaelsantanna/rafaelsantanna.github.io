import { json, skillsIndex } from '@/data/agent-discovery';
export function GET() {
  return json(skillsIndex());
}
