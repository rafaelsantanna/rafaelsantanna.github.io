import { machineRoutes } from '@/data/machine';

export function getStaticPaths() {
  return machineRoutes().map((route) => ({
    params: { locale: route.locale, slug: route.slug },
    props: { markdown: route.markdown },
  }));
}

export function GET({ props }: { props: { markdown: string } }) {
  return new Response(props.markdown, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
