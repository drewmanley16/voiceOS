import { ConversationProvider } from '@elevenlabs/react';
import { Orb } from './components/Orb';
import { clientTools } from './tools/clientTools';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

function App() {
  if (!AGENT_ID) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <p className="text-xs text-red-400 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
          Missing VITE_ELEVENLABS_AGENT_ID in .env
        </p>
      </div>
    );
  }

  if (!AGENT_ID.startsWith('agent_')) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <p className="text-xs text-amber-400 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center leading-relaxed">
          Invalid Agent ID — should start with "agent_". You may have pasted your API key (sk_...) instead.
          Find your Agent ID at elevenlabs.io/app/agents
        </p>
      </div>
    );
  }

  return (
    <ConversationProvider
      clientTools={clientTools}
      onConnect={() => {
        console.log('[Aura] Connected to ElevenLabs agent');
      }}
      onDisconnect={() => {
        console.log('[Aura] Disconnected from agent');
      }}
      onError={(error) => {
        console.error('[Aura] Connection error:', error);
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-start bg-transparent">
        <Orb />
      </div>
    </ConversationProvider>
  );
}

export default App;
