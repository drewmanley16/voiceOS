# Aura

A voice-first macOS desktop commander. Control your entire computer by voice — open apps, search files, manage calendar, send emails, play music, and more. No keyboard required.

Built with [Cursor](https://cursor.com) + [ElevenLabs](https://elevenlabs.io) for the #ElevenHacks hackathon.

## How It Works

Aura is a floating orb that lives on your screen. It connects to an ElevenLabs Conversational AI agent that listens to your voice, understands your intent, and executes macOS system commands via AppleScript.

**Voice in → ElevenLabs Agent (STT + LLM + TTS) → System Commands → Voice out**

## Features

- **Open Apps** — "Open Spotify" / "Launch Safari"
- **Search Files** — "Find that project proposal PDF"
- **Calendar** — "What's on my calendar today?" / "Schedule a meeting at 3pm"
- **Email** — "Send an email to Sarah about the meeting"
- **Music Control** — "Play music" / "Skip track" / "Turn it down"
- **Volume** — "Set volume to 50%"
- **Screenshots** — "Take a screenshot"
- **Web** — "Search for the best coffee shops nearby"
- **Notes** — "Create a note about today's ideas"
- **Weather** — "What's the weather like?"
- **Timers** — "Set a timer for 10 minutes"

## Quick Start

```bash
# Install dependencies
npm install

# Set your ElevenLabs Agent ID
cp .env.example .env
# Edit .env with your agent ID

# Run in development
npm run electron:dev

# Build for production
npm run electron:build
```

## Setup

See [SETUP.md](./SETUP.md) for detailed instructions on creating the ElevenLabs agent and configuring tools.

## Tech Stack

- **Electron** — Desktop app with transparent overlay window
- **React + TypeScript** — UI layer
- **ElevenLabs Conversational AI** — Real-time voice-to-voice with tool calling
- **Framer Motion** — Animated floating orb
- **Tailwind CSS** — Styling
- **AppleScript** — macOS system integration

## Architecture

```
User Voice → ElevenLabs Agent → Client Tool Call → IPC → Main Process → AppleScript → macOS
                                                                         ↓
User Hears ← ElevenLabs TTS  ← Tool Result     ← IPC ← Main Process ← Result
```

## License

MIT
