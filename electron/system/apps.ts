import { runAppleScript } from './applescript';

export async function openApplication(appName: string): Promise<string> {
  await runAppleScript(`tell application "${appName}" to activate`);
  return `Opened ${appName}`;
}
