import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

const project = 'dongyi-me';
const account = 'd52fea0c6bf3d9d37c067ce63cf453d0';
const env = { ...process.env, CLOUDFLARE_ACCOUNT_ID: account };
function cf(args) {
  // Keep credentials and upload JWTs inside captured output, never in logs or arguments.
  const result = execFileSync('cf', [...args, '--quiet'], { env, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  return JSON.parse(result);
}
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ttf': 'font/ttf' };
async function filesAt(directory) {
  const paths = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...await filesAt(path));
    else if (entry.isFile()) paths.push(path);
  }
  return paths;
}
try {
  const tokenResponse = cf(['pages', 'projects', 'get-upload-token', project]);
  const jwt = tokenResponse.jwt || tokenResponse.result?.jwt;
  if (!jwt) throw new Error('cf did not return a Pages upload token.');
  const manifest = {};
  const assets = [];
  for (const path of await filesAt('dist')) {
    const bytes = await readFile(path);
    const extension = extname(path);
    const hash = createHash('sha256').update(bytes).update(extension).digest('hex').slice(0, 32);
    manifest['/' + path.slice(5).replaceAll('\\', '/')] = hash;
    assets.push({ key: hash, value: bytes.toString('base64'), base64: true, metadata: { contentType: mime[extension] || 'application/octet-stream' } });
  }
  async function assetRequest(operation, body) {
    const response = await fetch('https://api.cloudflare.com/client/v4/pages/assets/' + operation, {
      method: 'POST', headers: { Authorization: 'Bearer ' + jwt, 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(`Pages asset ${operation} failed (${response.status}): ${JSON.stringify(result.errors || [])}`);
    return result;
  }
  const hashes = assets.map(asset => asset.key);
  const missing = new Set((await assetRequest('check-missing', { hashes })).result);
  const upload = assets.filter(asset => missing.has(asset.key));
  if (upload.length) await assetRequest('upload', upload);
  await assetRequest('upsert-hashes', { hashes });
  console.log(`Pages assets ready (${assets.length} files, ${upload.length} uploaded).`);
  const response = cf(['pages', 'projects', 'deployments', 'create', project, '--branch', 'main', '--commit-dirty', 'true', '--manifest', JSON.stringify(manifest)]);
  let deployment = response.result || response;
  for (let attempt = 0; attempt < 20 && deployment.latest_stage?.status !== 'success'; attempt++) {
    if (['failure', 'canceled'].includes(deployment.latest_stage?.status)) throw new Error('Pages deployment did not succeed: ' + deployment.id);
    await new Promise(resolve => setTimeout(resolve, 2000));
    const status = cf(['pages', 'projects', 'deployments', 'get', deployment.id, '--project-name', project]);
    deployment = status.result || status;
  }
  if (deployment.latest_stage?.status !== 'success') throw new Error('Pages deployment remains pending; check deployment ' + deployment.id);
  console.log(JSON.stringify({ id: deployment.id, url: deployment.url, environment: deployment.environment, stage: deployment.latest_stage }, null, 2));
} catch (error) {
  // execFileSync errors can contain captured credential responses; never print those objects.
  console.error(error.status === undefined ? error.message : `cf command failed (exit ${error.status}); check cf auth whoami.`);
  process.exitCode = 1;
}
