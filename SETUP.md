# Aura - Setup Guide

## 1. Create ElevenLabs Conversational AI Agent

Go to [https://elevenlabs.io/app/agents](https://elevenlabs.io/app/agents) and create a new agent.

### Agent Settings

- **Name**: Aura
- **First Message**: "Hey! I'm Aura, your desktop assistant. What can I help you with?"
- **Language**: English

### System Prompt

```
You are Aura, a voice-first desktop assistant for macOS. You help the user control their computer entirely by voice. You can open apps, search files, manage their calendar, send emails, control music playback, adjust system settings, take screenshots, search the web, create notes, set timers, and check the weather.

Guidelines:
- Be concise and conversational. Keep responses under 2 sentences unless the user asks for detail.
- Confirm destructive actions briefly before executing (sending emails, creating events).
- When reporting results, summarize naturally rather than reading raw data.
- If a tool returns an error, explain what went wrong in plain language and suggest a fix.
- Use a friendly, warm tone. You're a helpful companion, not a robotic assistant.
```

### Voice

Choose a natural voice. Recommendations:
- "Rachel" (warm, natural female)
- "Adam" (clear, friendly male)
- Or clone your own voice for the demo video

### Client Tools

Create the following tools in the agent's Tools section. Set each to type **Client** with **Wait for response** enabled.

#### open_application
- Description: Opens a macOS application by name
- Parameters:
  - `app_name` (string, required): The name of the application to open (e.g., "Spotify", "Safari", "Notes")

#### search_files
- Description: Searches for files on the computer using Spotlight
- Parameters:
  - `query` (string, required): The search query for finding files

#### get_calendar_events
- Description: Gets calendar events for a specific date
- Parameters:
  - `date` (string, required): The date to check in format like "May 7, 2026"

#### create_calendar_event
- Description: Creates a new calendar event
- Parameters:
  - `title` (string, required): The event title
  - `date` (string, required): The date in format like "May 7, 2026"
  - `time` (string, required): The time in format like "3:00 PM"

#### send_email
- Description: Sends an email via Mail.app
- Parameters:
  - `to` (string, required): Recipient email address
  - `subject` (string, required): Email subject line
  - `body` (string, required): Email body content

#### control_music
- Description: Controls Spotify music playback
- Parameters:
  - `action` (string, required): One of: play, pause, next, previous, volume, current
  - `value` (number, optional): Volume level 0-100 (only for volume action)

#### set_system_volume
- Description: Sets the macOS system volume
- Parameters:
  - `level` (number, required): Volume level from 0 to 100

#### take_screenshot
- Description: Takes a screenshot and saves it to the Desktop
- Parameters: none

#### open_url
- Description: Opens a URL in the default browser
- Parameters:
  - `url` (string, required): The URL to open

#### web_search
- Description: Searches the web using Google
- Parameters:
  - `query` (string, required): The search query

#### create_note
- Description: Creates a new note in Notes.app
- Parameters:
  - `title` (string, required): The note title
  - `body` (string, required): The note content

#### get_weather
- Description: Gets current weather for a location
- Parameters:
  - `location` (string, required): City name or location

#### set_timer
- Description: Sets a timer with a notification
- Parameters:
  - `minutes` (number, required): Number of minutes for the timer
  - `label` (string, required): Description of what the timer is for

## 2. Get Your Agent ID

After creating the agent, copy the Agent ID from the agent settings page.

## 3. Configure Environment

Create a `.env` file in the project root:

```
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here
```

## 4. Grant macOS Permissions

When you first run Aura, macOS will prompt for:
- **Microphone access** - required for voice input
- **Automation** - required to control other apps via AppleScript
- **Accessibility** - may be needed for some system controls

Go to System Settings > Privacy & Security to manage these.

## 5. Run the App

```bash
# Development mode
npm run electron:dev

# Production build
npm run electron:build
```
