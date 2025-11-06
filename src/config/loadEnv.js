import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

let envLoaded = false;

export function loadEnv(options = {}) {
  if (envLoaded) {
    return;
  }

  const providedPath = options.path;
  const envPath = resolve(providedPath ?? '.env');

  if (!existsSync(envPath)) {
    envLoaded = true;
    return;
  }

  const contents = readFileSync(envPath, 'utf8');
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.startsWith('#')) {
      continue;
    }

    const equalsIndex = line.indexOf('=');

    if (equalsIndex === -1) {
      continue;
    }

    const key = line.slice(0, equalsIndex).trim();
    const value = line.slice(equalsIndex + 1).trim();

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  envLoaded = true;
}
