import { runShell } from './applescript';

export async function openUrl(url: string): Promise<string> {
  await runShell(`open "${url}"`);
  return `Opened ${url}`;
}

export async function webSearch(query: string): Promise<string> {
  const encoded = encodeURIComponent(query);
  const url = `https://www.google.com/search?q=${encoded}`;
  await runShell(`open "${url}"`);
  return `Searching the web for "${query}"`;
}
