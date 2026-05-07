import { runShell } from './applescript';

export async function searchFiles(query: string): Promise<string> {
  const results = await runShell(`mdfind "${query.replace(/"/g, '\\"')}" | head -10`);
  if (!results) {
    return `No files found matching "${query}"`;
  }
  const files = results.split('\n');
  return `Found ${files.length} files:\n${files.map(f => `- ${f.split('/').pop()}`).join('\n')}`;
}
