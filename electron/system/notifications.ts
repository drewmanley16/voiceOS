import { runAppleScript } from './applescript';

export async function getRecentNotifications(): Promise<string> {
  const script = `
tell application "System Events"
  try
    set ncProcess to first process whose name is "NotificationCenter"
    set ncWindows to windows of ncProcess
    if (count of ncWindows) is 0 then
      return "No recent notifications visible"
    end if
    set notifTexts to {}
    repeat with w in ncWindows
      try
        set notifTexts to notifTexts & {name of w}
      end try
    end repeat
    return notifTexts as text
  on error
    return "Could not read notifications — check accessibility permissions"
  end try
end tell`;
  try {
    const result = await runAppleScript(script);
    return result || 'No recent notifications';
  } catch {
    return 'Could not access notifications. Grant Aura accessibility permissions in System Settings → Privacy & Security → Accessibility.';
  }
}

export async function sendNotification(title: string, message: string): Promise<string> {
  const escapedTitle = title.replace(/"/g, '\\"');
  const escapedMsg = message.replace(/"/g, '\\"');
  await runAppleScript(
    `display notification "${escapedMsg}" with title "${escapedTitle}" sound name "default"`
  );
  return `Notification sent: ${title}`;
}
