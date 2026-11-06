import { mkdir, cp, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const path of ['index.html', 'style.css', 'script.js', 'assets', 'robots.txt', 'sitemap.xml']) {
  await cp(path, `dist/${path}`, { recursive: true, filter: (source) => !source.endsWith('.source.txt') });
}
console.log('Static website built in dist/');
