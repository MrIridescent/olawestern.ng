/**
 * Builds the frozen static export used for the Qoder Sites pitch preview.
 *
 *   node scripts/sites-export.mjs
 *
 * Next.js `output: 'export'` cannot include POST route handlers, and the
 * /admin CMS needs its server APIs, so both are moved aside for the duration
 * of the build and always restored. The normal SSR build (`npm run build`)
 * is untouched by this script.
 */
import { existsSync, renameSync, readdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const moves = [
  [join(root, 'src', 'app', 'api'), join(root, 'src', 'app', '_api-export-backup')],
  [join(root, 'src', 'app', 'admin'), join(root, 'src', 'app', '_admin-export-backup')],
];

if (moves.some(([, backup]) => existsSync(backup))) {
  console.error(`Refusing to run: an *_export-backup directory already exists (a previous export was interrupted?).\nRestore it first.`);
  process.exit(1);
}

const nextBin = join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'next.cmd' : 'next');
if (!existsSync(nextBin)) {
  console.error('next binary not found — run npm install first.');
  process.exit(1);
}

for (const [dir, backup] of moves) {
  renameSync(dir, backup);
}
console.log('API routes + /admin moved aside for static export.');

let failed = null;
try {
  const res = spawnSync(nextBin, ['build'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      NEXT_OUTPUT: 'export',
      NEXT_PUBLIC_SITES_DEMO: '1',
    },
  });
  if (res.status !== 0) failed = `next build exited with code ${res.status}`;
} catch (err) {
  failed = String(err);
} finally {
  for (const [dir, backup] of moves.slice().reverse()) {
    renameSync(backup, dir);
  }
  console.log('API routes + /admin restored.');
}

if (failed) {
  console.error(`Export failed: ${failed}`);
  process.exit(1);
}

const outDir = join(root, 'out');
// Internal docs must not ship in the public bundle.
rmSync(join(outDir, 'images', 'README.md'), { force: true });
console.log(`\nStatic export OK → ${outDir}`);
console.log('Contents:', readdirSync(outDir).join(', '));
