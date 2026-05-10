import { runShell } from './applescript';
import { homedir } from 'os';
import { join } from 'path';
import { readFileSync, unlinkSync } from 'fs';

export async function captureScreenForContext(): Promise<string> {
  const tmpPath = join(homedir(), '.aura-screen-capture.png');
  try {
    await runShell(`screencapture -x -C "${tmpPath}"`);

    const buffer = readFileSync(tmpPath);
    const base64 = buffer.toString('base64');

    try { unlinkSync(tmpPath); } catch {}

    return base64;
  } catch {
    return '';
  }
}

export async function getActiveWindowInfo(): Promise<string> {
  try {
    const result = await runShell(
      `osascript -e 'tell application "System Events" to get {name, title of first window} of first process whose frontmost is true' 2>/dev/null || echo "Unknown"`
    );
    return result || 'Could not determine active window';
  } catch {
    return 'Could not determine active window';
  }
}
