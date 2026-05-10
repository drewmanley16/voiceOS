import { app } from 'electron';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';

export interface AuraSettings {
  windowX?: number;
  windowY?: number;
  inputMode: 'click' | 'push-to-talk' | 'always-on';
}

const DEFAULTS: AuraSettings = {
  inputMode: 'click',
};

function getSettingsPath(): string {
  const dir = join(app.getPath('userData'), 'config');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return join(dir, 'settings.json');
}

export function loadSettings(): AuraSettings {
  try {
    const raw = readFileSync(getSettingsPath(), 'utf-8');
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings: Partial<AuraSettings>): AuraSettings {
  const current = loadSettings();
  const merged = { ...current, ...settings };
  writeFileSync(getSettingsPath(), JSON.stringify(merged, null, 2));
  return merged;
}
