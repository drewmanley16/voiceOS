import { runAppleScript } from './applescript';

const activeTimers: Map<string, NodeJS.Timeout> = new Map();

export async function setTimer(minutes: number, label: string): Promise<string> {
  const ms = minutes * 60 * 1000;
  const id = `timer-${Date.now()}`;

  const timeout = setTimeout(async () => {
    await runAppleScript(
      `display notification "Timer complete: ${label}" with title "Aura" sound name "Glass"`
    );
    activeTimers.delete(id);
  }, ms);

  activeTimers.set(id, timeout);
  return `Timer set for ${minutes} minute${minutes !== 1 ? 's' : ''}: "${label}"`;
}
