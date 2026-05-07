import { runAppleScriptMultiline } from './applescript';

export async function getCalendarEvents(date: string): Promise<string> {
  const script = `
tell application "Calendar"
  set today to date "${date}"
  set tomorrow to today + 1 * days
  set eventList to ""
  repeat with cal in calendars
    set evts to (every event of cal whose start date ≥ today and start date < tomorrow)
    repeat with evt in evts
      set eventList to eventList & (summary of evt) & " at " & time string of (start date of evt) & "\\n"
    end repeat
  end repeat
  if eventList is "" then
    return "No events scheduled"
  end if
  return eventList
end tell`;
  try {
    const result = await runAppleScriptMultiline(script);
    return result || 'No events scheduled for today';
  } catch {
    return 'Could not access calendar. Please grant Calendar access in System Settings.';
  }
}

export async function createCalendarEvent(title: string, date: string, time: string): Promise<string> {
  const script = `
tell application "Calendar"
  tell calendar 1
    set startDate to date "${date} ${time}"
    set endDate to startDate + 1 * hours
    make new event with properties {summary:"${title}", start date:startDate, end date:endDate}
  end tell
end tell`;
  try {
    await runAppleScriptMultiline(script);
    return `Created event "${title}" on ${date} at ${time}`;
  } catch {
    return 'Could not create calendar event. Please grant Calendar access in System Settings.';
  }
}
