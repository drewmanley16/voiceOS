import { runAppleScript, runShell } from './applescript';
import { homedir } from 'os';
import { join } from 'path';

export async function setSystemVolume(level: number): Promise<string> {
  const clamped = Math.max(0, Math.min(100, Math.round(level)));
  await runAppleScript(`set volume output volume ${clamped}`);
  return `Volume set to ${clamped}%`;
}

export async function takeScreenshot(): Promise<string> {
  const filename = `screenshot-${Date.now()}.png`;
  const filepath = join(homedir(), 'Desktop', filename);
  await runShell(`screencapture -x "${filepath}"`);
  return `Screenshot saved to Desktop as ${filename}`;
}
