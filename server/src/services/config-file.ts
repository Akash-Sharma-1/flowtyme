import fs from 'fs';
import path from 'path';

const CONFIG_PATH = path.join(process.cwd(), '.flowtyme-config.json');

export function readConfigFile(): Record<string, unknown> | null {
  try {
    if (!fs.existsSync(CONFIG_PATH)) return null;
    const raw = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    // strip Mongoose internals so create() generates a fresh _id
    const { _id, __v, ...rest } = raw as Record<string, unknown>;
    void _id; void __v;
    return rest;
  } catch {
    return null;
  }
}

export function writeConfigFile(config: Record<string, unknown>): void {
  try {
    const { _id, __v, ...rest } = config;
    void _id; void __v;
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(rest, null, 2));
  } catch {
    // best-effort — don't crash the server
  }
}
