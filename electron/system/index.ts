import { openApplication } from './apps';
import { searchFiles } from './files';
import { getCalendarEvents, createCalendarEvent } from './calendar';
import { sendEmail } from './email';
import { controlMusic } from './music';
import { setSystemVolume, takeScreenshot } from './system';
import { openUrl, webSearch } from './browser';
import { createNote } from './notes';
import { getWeather } from './weather';
import { setTimer } from './timer';
import { getRecentNotifications, sendNotification } from './notifications';
import { captureScreenForContext, getActiveWindowInfo } from './screen';

export async function handleCommand(command: string, params: Record<string, unknown>): Promise<string> {
  switch (command) {
    case 'open_application':
      return openApplication(params.app_name as string);
    case 'search_files':
      return searchFiles(params.query as string);
    case 'get_calendar_events':
      return getCalendarEvents(params.date as string);
    case 'create_calendar_event':
      return createCalendarEvent(
        params.title as string,
        params.date as string,
        params.time as string
      );
    case 'send_email':
      return sendEmail(
        params.to as string,
        params.subject as string,
        params.body as string
      );
    case 'control_music':
      return controlMusic(params.action as string, params.value as number | undefined);
    case 'set_system_volume':
      return setSystemVolume(params.level as number);
    case 'take_screenshot':
      return takeScreenshot();
    case 'open_url':
      return openUrl(params.url as string);
    case 'web_search':
      return webSearch(params.query as string);
    case 'create_note':
      return createNote(params.title as string, params.body as string);
    case 'get_weather':
      return getWeather(params.location as string);
    case 'set_timer':
      return setTimer(params.minutes as number, params.label as string);
    case 'get_notifications':
      return getRecentNotifications();
    case 'send_notification':
      return sendNotification(params.title as string, params.message as string);
    case 'capture_screen':
      return captureScreenForContext();
    case 'get_active_window':
      return getActiveWindowInfo();
    default:
      return `Unknown command: ${command}`;
  }
}
