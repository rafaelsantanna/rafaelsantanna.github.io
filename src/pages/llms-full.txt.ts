import { llmsFull } from '@/data/machine';
export function GET() { return new Response(llmsFull(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }); }
