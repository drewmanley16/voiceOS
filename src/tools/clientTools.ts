function dispatchAction(action: string) {
  window.dispatchEvent(
    new CustomEvent('aura-action', { detail: { action } })
  );
}

const exec = async (command: string, params: Record<string, unknown>): Promise<string> => {
  dispatchAction(command.replace(/_/g, ' '));

  if (window.electronAPI) {
    return window.electronAPI.executeCommand(command, params);
  }
  return `[dev mode] Would execute: ${command} with ${JSON.stringify(params)}`;
};

export const clientTools = {
  open_application: async (params: { app_name: string }) => {
    return exec('open_application', params);
  },

  search_files: async (params: { query: string }) => {
    return exec('search_files', params);
  },

  get_calendar_events: async (params: { date: string }) => {
    return exec('get_calendar_events', params);
  },

  create_calendar_event: async (params: { title: string; date: string; time: string }) => {
    return exec('create_calendar_event', params);
  },

  send_email: async (params: { to: string; subject: string; body: string }) => {
    return exec('send_email', params);
  },

  control_music: async (params: { action: string; value?: number }) => {
    return exec('control_music', params);
  },

  set_system_volume: async (params: { level: number }) => {
    return exec('set_system_volume', params);
  },

  take_screenshot: async () => {
    return exec('take_screenshot', {});
  },

  open_url: async (params: { url: string }) => {
    return exec('open_url', params);
  },

  web_search: async (params: { query: string }) => {
    return exec('web_search', params);
  },

  create_note: async (params: { title: string; body: string }) => {
    return exec('create_note', params);
  },

  get_weather: async (params: { location: string }) => {
    return exec('get_weather', params);
  },

  set_timer: async (params: { minutes: number; label: string }) => {
    return exec('set_timer', params);
  },
};
