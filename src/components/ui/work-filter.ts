export const ALL = 'all';

export function matchesFilter(kind: string | undefined, filter: string): boolean {
  return filter === ALL || kind === filter;
}

/** Fills a "{n}" template, choosing the singular form for exactly one item. */
export function formatCount(count: number, one: string, other: string): string {
  return (count === 1 ? one : other).replace('{n}', String(count));
}
