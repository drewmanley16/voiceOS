import { runAppleScriptMultiline } from './applescript';

export async function sendEmail(to: string, subject: string, body: string): Promise<string> {
  const script = `
tell application "Mail"
  set newMessage to make new outgoing message with properties {subject:"${subject.replace(/"/g, '\\"')}", content:"${body.replace(/"/g, '\\"')}"}
  tell newMessage
    make new to recipient with properties {address:"${to}"}
  end tell
  send newMessage
end tell`;
  try {
    await runAppleScriptMultiline(script);
    return `Email sent to ${to} with subject "${subject}"`;
  } catch {
    return 'Could not send email. Please make sure Mail.app is configured.';
  }
}
