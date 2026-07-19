// Generates public/rss.xml from src/data/blog.ts and pings IndexNow so
// Bing / Yandex / Seznam discover new posts. Runs on predev + prebuild.
// Google deprecated its /ping endpoint in 2023 — we rely on sitemap.xml
// (already submitted in Search Console) for Google discovery.

import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { blogPosts } from '../src/data/blog';

const BASE_URL = 'https://kingbetexchange.live';
const INDEXNOW_KEY = '71d0bcb0753df22bbdb6b363e13965b4';

function escapeXml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const sorted = [...blogPosts].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
);

const items = sorted
  .map((p) => {
    const url = `${BASE_URL}/blog/${p.slug}`;
    const pubDate = new Date(p.date).toUTCString();
    return [
      '    <item>',
      `      <title>${escapeXml(p.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${pubDate}</pubDate>`,
      `      <category>${escapeXml(p.category)}</category>`,
      `      <description>${escapeXml(p.excerpt)}</description>`,
      '    </item>',
    ].join('\n');
  })
  .join('\n');

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>KingBet Exchange Blog</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${BASE_URL}/rss.xml" rel="self" type="application/rss+xml" />
    <description>Practical guides on crypto investing, wallet security, payouts, and platform comparisons from KingBet Exchange.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;

writeFileSync(resolve('public/rss.xml'), rss);
console.log(`rss.xml written (${sorted.length} posts)`);

// IndexNow ping — non-blocking, best-effort. Only runs in production build,
// to avoid pinging on every local dev start.
async function pingIndexNow() {
  const urlList = sorted.slice(0, 20).map((p) => `${BASE_URL}/blog/${p.slug}`);
  urlList.unshift(`${BASE_URL}/blog`, `${BASE_URL}/sitemap.xml`);

  const body = {
    host: 'kingbetexchange.live',
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList,
  };

  try {
    const res = await fetch('https://api.indexnow.org/IndexNow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(body),
    });
    console.log(`IndexNow ping: HTTP ${res.status} (${urlList.length} urls)`);
  } catch (e) {
    console.warn('IndexNow ping failed:', (e as Error).message);
  }
}

if (process.env.NODE_ENV === 'production' || process.argv.includes('--ping')) {
  await pingIndexNow();
}
