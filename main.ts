import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const GATE_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function packageEntry(): void {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(rootDir, 'game'), join(outputDir, 'game'), { recursive: true });

  const shotsDest = join(outputDir, 'screenshots');
  mkdirSync(shotsDest, { recursive: true });
  const shotsSrc = join(rootDir, 'screenshots');
  if (existsSync(shotsSrc)) {
    cpSync(shotsSrc, shotsDest, { recursive: true });
  }

  const dossierJson = buildDossier(outputDir, GATE_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossierJson);
}

packageEntry();
