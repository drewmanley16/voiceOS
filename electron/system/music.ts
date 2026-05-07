import { runAppleScript } from './applescript';

export async function controlMusic(action: string, value?: number): Promise<string> {
  try {
    switch (action) {
      case 'play':
        await runAppleScript('tell application "Spotify" to play');
        return 'Playing music';
      case 'pause':
        await runAppleScript('tell application "Spotify" to pause');
        return 'Music paused';
      case 'next':
        await runAppleScript('tell application "Spotify" to next track');
        return 'Skipped to next track';
      case 'previous':
        await runAppleScript('tell application "Spotify" to previous track');
        return 'Went to previous track';
      case 'volume':
        if (value !== undefined) {
          await runAppleScript(`tell application "Spotify" to set sound volume to ${Math.round(value)}`);
          return `Set Spotify volume to ${Math.round(value)}%`;
        }
        return 'No volume level specified';
      case 'current':
        const name = await runAppleScript('tell application "Spotify" to name of current track');
        const artist = await runAppleScript('tell application "Spotify" to artist of current track');
        return `Now playing: ${name} by ${artist}`;
      default:
        return `Unknown music action: ${action}`;
    }
  } catch {
    return 'Could not control Spotify. Is it installed and running?';
  }
}
