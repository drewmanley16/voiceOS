import { runAppleScriptMultiline } from './applescript';

export async function createNote(title: string, body: string): Promise<string> {
  const script = `
tell application "Notes"
  tell account 1
    make new note at folder "Notes" with properties {name:"${title.replace(/"/g, '\\"')}", body:"${body.replace(/"/g, '\\"')}"}
  end tell
end tell`;
  try {
    await runAppleScriptMultiline(script);
    return `Created note "${title}"`;
  } catch {
    return 'Could not create note. Please grant Notes access in System Settings.';
  }
}
