import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Scenario } from '../../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const scenariosPath = join(__dirname, '../../src/data/scenarios.json');

export const scenarios: Scenario[] = JSON.parse(readFileSync(scenariosPath, 'utf-8'));

export function findScenario(id: string): Scenario | undefined {
  return scenarios.find((s) => s.id === id);
}
