// Leonida Legend — the hand-in program for gta6-trophy-guide-01 (Node 22, standard
// library only). It copies this repository's app/ and screenshots/ into the output
// directory (MAKEFUN_OUTPUT_DIR outside the grader, /output inside it) and writes
// /output/dossier.json with the vendored make.fun library, exactly as the starter
// did. Leave vendor/makefun-frontend.ts as it is: the scorer requires dossier.json
// to be byte for byte what its own copy of the library writes.
//
// Hardened output handling (a sibling entry failed grading here): this program
// never removes the output directory itself. It clears only the directory's
// contents, so it still works when the output directory is owned by another user
// inside a sticky parent directory — deleting the directory itself would fail
// there with EPERM. It also builds the dossier twice in memory and refuses
// (non-zero exit) if the two builds differ, so a non-deterministic hand-in can
// never be written. Run it twice in a row and the two outputs are byte-identical.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Clear only the contents of the output directory, never the directory itself:
// the grader may own /output while this process runs as another user in a sticky
// parent, where removing the directory itself is refused (EPERM) but removing
// entries inside it — which we own, having just created them — succeeds.
function clearOutputContents(directory) {
  mkdirSync(directory, { recursive: true });
  for (const entry of readdirSync(directory)) {
    rmSync(join(directory, entry), { recursive: true, force: true });
  }
}

const appSource = join(here, 'app');
const shotsSource = join(here, 'screenshots');
if (!existsSync(appSource)) {
  console.error('app/ is missing from the repository; nothing to hand in.');
  process.exit(1);
}

clearOutputContents(out);
cpSync(appSource, join(out, 'app'), { recursive: true });
if (existsSync(shotsSource)) {
  cpSync(shotsSource, join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes;
// the others refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of app files:
// app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
const dossierOptions = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
};

// Build the dossier twice in memory and refuse to write anything if the builds
// disagree: a hand-in must be reproducible, run after run. buildDossier returns
// a Uint8Array, so compare the bytes, not the objects (two equal builds are
// still two different objects).
const firstBuild = buildDossier(out, dossierOptions);
const secondBuild = buildDossier(out, dossierOptions);
if (!Buffer.from(firstBuild).equals(Buffer.from(secondBuild))) {
  console.error('dossier builds differ between two runs in memory; refusing to hand in a non-deterministic entry.');
  process.exit(1);
}

writeFileSync(join(out, 'dossier.json'), firstBuild);

// Verify what was written: read it back and refuse to call the hand-in done
// unless the file on disk is byte for byte the build we just made.
const written = readFileSync(join(out, 'dossier.json'));
if (!written.equals(Buffer.from(firstBuild))) {
  console.error('dossier.json on disk differs from the build in memory; the hand-in is not trustworthy.');
  process.exit(1);
}

console.log('Handed in: app/ + screenshots/ copied to ' + out + ', dossier.json written (' + firstBuild.length + ' bytes).');
