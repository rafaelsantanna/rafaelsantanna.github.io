export function GET() {
  return new Response(`User-agent: *
Allow: /

User-agent: GPTBot
Disallow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Disallow: /
User-agent: Claude-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Google-Extended
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Applebot-Extended
Disallow: /

# Search and agent input are welcome. Model training is not licensed.
Content-Signal: ai-train=no, search=yes, ai-input=yes
Sitemap: https://rafaelsantanna.github.io/sitemap.xml
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
