import { runAppleScriptMultiline } from './applescript';

export async function sendEmail(to: string, subject: string, body: string): Promise<string> {
  const escapedSubject = subject.replace(/"/g, '\\"');
  const escapedBody = body.replace(/"/g, '\\"');

  const script = `
tell application "Mail"
  set newMessage to make new outgoing message with properties {subject:"${escapedSubject}", content:"${escapedBody}", visible:true}
  tell newMessage
    make new to recipient with properties {address:"${to}"}
  end tell
  activate
end tell`;
  try {
    await runAppleScriptMultiline(script);
    return `Email draft created to ${to} with subject "${subject}" — opened in Mail for review before sending`;
  } catch {
    return 'Could not create email. Please make sure Mail.app is configured.';
  }
}
