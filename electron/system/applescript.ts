import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function runAppleScript(script: string): Promise<string> {
  const escaped = script.replace(/'/g, "'\\''");
  const { stdout } = await execAsync(`osascript -e '${escaped}'`, {
    timeout: 15000,
  });
  return stdout.trim();
}

export async function runAppleScriptMultiline(script: string): Promise<string> {
  const { stdout } = await execAsync(`osascript -e ${JSON.stringify(script)}`, {
    timeout: 15000,
  });
  return stdout.trim();
}

export async function runShell(command: string): Promise<string> {
  const { stdout } = await execAsync(command, { timeout: 15000 });
  return stdout.trim();
}
