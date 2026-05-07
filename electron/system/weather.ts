import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function getWeather(location: string): Promise<string> {
  try {
    const { stdout } = await execAsync(
      `curl -s "wttr.in/${encodeURIComponent(location)}?format=%C+%t+%h+%w"`,
      { timeout: 10000 }
    );
    const weather = stdout.trim();
    if (weather && !weather.includes('Unknown location')) {
      return `Weather in ${location}: ${weather}`;
    }
    return `Could not find weather for "${location}"`;
  } catch {
    return 'Could not fetch weather data. Check your internet connection.';
  }
}
