import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

type InputMode = 'click' | 'push-to-talk' | 'always-on';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  inputMode: InputMode;
  onInputModeChange: (mode: InputMode) => void;
  theme: string;
}

const MODE_INFO: Record<InputMode, { label: string; desc: string; icon: string }> = {
  'click':         { label: 'Click to Talk', desc: 'Click orb to start/stop',     icon: '👆' },
  'push-to-talk':  { label: 'Push to Talk',  desc: 'Hold Space to speak',          icon: '⌨️' },
  'always-on':     { label: 'Always On',     desc: 'Auto-connects on launch',      icon: '🎙️' },
};

export function Settings({ isOpen, onClose, inputMode, onInputModeChange, theme }: SettingsProps) {
  const [localMode, setLocalMode] = useState<InputMode>(inputMode);
  const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

  useEffect(() => {
    setLocalMode(inputMode);
  }, [inputMode]);

  const handleModeChange = (mode: InputMode) => {
    setLocalMode(mode);
    onInputModeChange(mode);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-xl no-drag"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm">⚙️</span>
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">Settings</span>
            </div>
            <button
              onClick={onClose}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/60">
                <path d="M2 2l6 6M8 2l-6 6" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 scrollbar-thin">
            {/* Agent Info */}
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider">Agent</label>
              <div className="mt-1.5 px-3 py-2 bg-white/5 rounded-xl border border-white/8">
                <p className="text-[11px] text-white/50 font-mono truncate">
                  {agentId || 'Not configured'}
                </p>
              </div>
            </div>

            {/* Theme indicator */}
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider">System Theme</label>
              <div className="mt-1.5 flex items-center gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/8">
                <span className="text-sm">{theme === 'dark' ? '🌙' : '☀️'}</span>
                <span className="text-[11px] text-white/60 capitalize">{theme} Mode</span>
                <span className="text-[9px] text-white/30 ml-auto">Auto-detected</span>
              </div>
            </div>

            {/* Input Mode */}
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider">Input Mode</label>
              <div className="mt-1.5 space-y-1.5">
                {(Object.keys(MODE_INFO) as InputMode[]).map((mode) => {
                  const info = MODE_INFO[mode];
                  const active = localMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => handleModeChange(mode)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                        active
                          ? 'bg-violet-500/15 border-violet-400/30 shadow-sm shadow-violet-500/10'
                          : 'bg-white/5 border-white/8 hover:bg-white/8'
                      }`}
                    >
                      <span className="text-sm">{info.icon}</span>
                      <div className="text-left">
                        <p className={`text-[11px] ${active ? 'text-white/90' : 'text-white/60'}`}>
                          {info.label}
                        </p>
                        <p className="text-[9px] text-white/30">{info.desc}</p>
                      </div>
                      {active && (
                        <motion.div
                          layoutId="active-mode"
                          className="ml-auto w-2 h-2 rounded-full bg-violet-400"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Shortcuts */}
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider">Keyboard Shortcuts</label>
              <div className="mt-1.5 space-y-1">
                <div className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/8">
                  <span className="text-[11px] text-white/50">Toggle Aura</span>
                  <kbd className="text-[10px] text-white/40 bg-white/8 rounded px-1.5 py-0.5 font-mono">⌘⇧A</kbd>
                </div>
                {localMode === 'push-to-talk' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-xl border border-white/8"
                  >
                    <span className="text-[11px] text-white/50">Push to Talk</span>
                    <kbd className="text-[10px] text-white/40 bg-white/8 rounded px-1.5 py-0.5 font-mono">Space</kbd>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <label className="text-[10px] text-white/40 uppercase tracking-wider">Capabilities</label>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {[
                  { icon: '🚀', label: 'Apps' },
                  { icon: '📅', label: 'Calendar' },
                  { icon: '✉️', label: 'Email' },
                  { icon: '🎵', label: 'Music' },
                  { icon: '📝', label: 'Notes' },
                  { icon: '🌤️', label: 'Weather' },
                  { icon: '🔍', label: 'Files' },
                  { icon: '🌐', label: 'Web' },
                  { icon: '📸', label: 'Screenshots' },
                  { icon: '🔊', label: 'Volume' },
                  { icon: '⏱️', label: 'Timers' },
                  { icon: '🔔', label: 'Alerts' },
                  { icon: '👁️', label: 'Screen' },
                  { icon: '🪟', label: 'Windows' },
                ].map((cap) => (
                  <div
                    key={cap.label}
                    className="flex items-center gap-1.5 px-2 py-1.5 bg-white/5 rounded-lg border border-white/5"
                  >
                    <span className="text-[10px]">{cap.icon}</span>
                    <span className="text-[9px] text-white/40">{cap.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Version */}
            <div className="text-center pt-2">
              <p className="text-[9px] text-white/15">Aura v1.0.0</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
