import { motion, AnimatePresence } from 'framer-motion';
import {
  useConversationControls,
  useConversationStatus,
  useConversationMode,
} from '@elevenlabs/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Transcription } from './Transcription';
import { ActionFeedback } from './ActionFeedback';
import { ConversationHistory } from './ConversationHistory';
import { Settings } from './Settings';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

type OrbState = 'idle' | 'connecting' | 'listening' | 'speaking' | 'error';
type InputMode = 'click' | 'push-to-talk' | 'always-on';

const PARTICLE_COUNT = 8;

export function Orb() {
  const { startSession, endSession, getInputByteFrequencyData, getOutputByteFrequencyData } =
    useConversationControls();
  const { status } = useConversationStatus();
  const { isSpeaking } = useConversationMode();
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [outputLevel, setOutputLevel] = useState(0);
  const animFrameRef = useRef<number>(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [theme, setTheme] = useState<string>('dark');
  const [inputMode, setInputMode] = useState<InputMode>('click');

  const [freqBands, setFreqBands] = useState<number[]>(new Array(6).fill(0));

  // Load settings and theme on mount
  useEffect(() => {
    if (window.electronAPI?.getTheme) {
      window.electronAPI.getTheme().then(setTheme);
    }
    if (window.electronAPI?.getSettings) {
      window.electronAPI.getSettings().then((s) => {
        if (s.inputMode) setInputMode(s.inputMode as InputMode);
      });
    }
  }, []);

  // Listen for macOS theme changes
  useEffect(() => {
    if (!window.electronAPI?.onThemeChanged) return;
    const cleanup = window.electronAPI.onThemeChanged(setTheme);
    return cleanup;
  }, []);

  useEffect(() => {
    if (status === 'disconnected') {
      if (orbState === 'connecting' || orbState === 'listening' || orbState === 'speaking') {
        setOrbState('error');
        setErrorMsg('Connection lost');
      } else if (orbState !== 'error') {
        setOrbState('idle');
      }
    } else if (status === 'connecting') {
      setOrbState('connecting');
      setErrorMsg('');
    } else if (status === 'connected') {
      setOrbState(isSpeaking ? 'speaking' : 'listening');
      setErrorMsg('');
      setRetryCount(0);
    }
  }, [status, isSpeaking]);

  useEffect(() => {
    if (status !== 'connected') return;

    const updateAudio = () => {
      const inputData = getInputByteFrequencyData();
      if (inputData && inputData.length > 0) {
        const avg = inputData.reduce((sum: number, val: number) => sum + val, 0) / inputData.length;
        setAudioLevel(avg / 255);

        const bandSize = Math.floor(inputData.length / 6);
        const bands = [];
        for (let i = 0; i < 6; i++) {
          const start = i * bandSize;
          let sum = 0;
          for (let j = start; j < start + bandSize && j < inputData.length; j++) {
            sum += inputData[j];
          }
          bands.push((sum / bandSize) / 255);
        }
        setFreqBands(bands);
      }

      const outputData = getOutputByteFrequencyData();
      if (outputData && outputData.length > 0) {
        const avg = outputData.reduce((sum: number, val: number) => sum + val, 0) / outputData.length;
        setOutputLevel(avg / 255);

        if (isSpeaking) {
          const bandSize = Math.floor(outputData.length / 6);
          const bands = [];
          for (let i = 0; i < 6; i++) {
            const start = i * bandSize;
            let sum = 0;
            for (let j = start; j < start + bandSize && j < outputData.length; j++) {
              sum += outputData[j];
            }
            bands.push((sum / bandSize) / 255);
          }
          setFreqBands(bands);
        }
      }

      animFrameRef.current = requestAnimationFrame(updateAudio);
    };

    animFrameRef.current = requestAnimationFrame(updateAudio);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status, isSpeaking, getInputByteFrequencyData, getOutputByteFrequencyData]);

  const connect = useCallback(async () => {
    try {
      setOrbState('connecting');
      setErrorMsg('');
      if (window.electronAPI) {
        const signedUrl = await window.electronAPI.getSignedUrl();
        await startSession({ signedUrl });
      } else {
        await startSession({ agentId: AGENT_ID });
      }
      setHasStarted(true);
    } catch (err) {
      console.error('[Aura] Connection failed:', err);
      setOrbState('error');
      setErrorMsg(err instanceof Error ? err.message : 'Connection failed');
      setRetryCount((c) => c + 1);
    }
  }, [startSession]);

  const disconnect = useCallback(async () => {
    await endSession();
    setHasStarted(false);
    setOrbState('idle');
  }, [endSession]);

  const handleClick = useCallback(async () => {
    if (orbState === 'error') {
      await connect();
      return;
    }
    if (status === 'connected') {
      await disconnect();
    } else if (status === 'disconnected') {
      await connect();
    }
  }, [status, orbState, disconnect, connect]);

  // Global hotkey listener
  useEffect(() => {
    if (!window.electronAPI?.onToggleConversation) return;
    const cleanup = window.electronAPI.onToggleConversation(() => {
      if (status === 'connected') {
        disconnect();
      } else if (status === 'disconnected') {
        connect();
      }
    });
    return cleanup;
  }, [status, disconnect, connect]);

  // Push-to-talk: hold Space to keep connected, release to disconnect
  useEffect(() => {
    if (inputMode !== 'push-to-talk') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && status === 'disconnected') {
        e.preventDefault();
        connect();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && status === 'connected') {
        e.preventDefault();
        disconnect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [inputMode, status, connect, disconnect]);

  // Auto-connect on mount (always-on mode or first load)
  useEffect(() => {
    if (AGENT_ID && status === 'disconnected' && !hasStarted) {
      if (inputMode === 'always-on' || inputMode === 'click') {
        const timer = setTimeout(() => {
          connect();
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Auto-retry on error (with backoff, max 3 times)
  useEffect(() => {
    if (orbState !== 'error' || retryCount >= 3) return;
    const delay = Math.min(2000 * Math.pow(2, retryCount), 10000);
    const timer = setTimeout(() => connect(), delay);
    return () => clearTimeout(timer);
  }, [orbState, retryCount, connect]);

  const handleInputModeChange = (mode: InputMode) => {
    setInputMode(mode);
    if (window.electronAPI?.saveSettings) {
      window.electronAPI.saveSettings({ inputMode: mode });
    }
  };

  const activeLevel = orbState === 'speaking' ? outputLevel : audioLevel;
  const scale = 1 + activeLevel * 0.15;

  const isLight = theme === 'light';

  const gradients: Record<OrbState, string> = {
    idle: isLight
      ? 'from-indigo-500 via-purple-500 to-blue-600'
      : 'from-indigo-600 via-purple-600 to-blue-700',
    connecting: 'from-purple-500 via-indigo-500 to-blue-500',
    listening: isLight
      ? 'from-violet-400 via-purple-400 to-fuchsia-400'
      : 'from-violet-500 via-purple-500 to-fuchsia-500',
    speaking: isLight
      ? 'from-amber-300 via-orange-300 to-yellow-400'
      : 'from-amber-400 via-orange-400 to-yellow-500',
    error: 'from-red-500 via-rose-500 to-red-700',
  };

  const glows: Record<OrbState, string> = {
    idle: isLight
      ? '0 0 30px rgba(99,102,241,0.2), 0 0 60px rgba(99,102,241,0.08)'
      : '0 0 30px rgba(99,102,241,0.3), 0 0 60px rgba(99,102,241,0.1)',
    connecting: '0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.15)',
    listening: isLight
      ? '0 0 50px rgba(139,92,246,0.35), 0 0 100px rgba(139,92,246,0.12)'
      : '0 0 50px rgba(139,92,246,0.5), 0 0 100px rgba(139,92,246,0.2)',
    speaking: isLight
      ? '0 0 60px rgba(245,158,11,0.35), 0 0 120px rgba(245,158,11,0.12)'
      : '0 0 60px rgba(245,158,11,0.5), 0 0 120px rgba(245,158,11,0.2)',
    error: '0 0 40px rgba(239,68,68,0.5), 0 0 80px rgba(239,68,68,0.2)',
  };

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      {/* Top bar: history + settings + hotkey */}
      <div className="absolute top-3 left-3 flex gap-1.5 no-drag">
        <motion.button
          onClick={() => { setShowHistory(!showHistory); setShowSettings(false); }}
          className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors border border-white/10"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Conversation History"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/50">
            <path d="M2 3h8M2 6h6M2 9h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </motion.button>
        <motion.button
          onClick={() => { setShowSettings(!showSettings); setShowHistory(false); }}
          className="w-7 h-7 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors border border-white/10"
          whileHover={{ scale: 1.1, rotate: 45 }}
          whileTap={{ scale: 0.9 }}
          title="Settings"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white/50">
            <circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.2" />
            <path d="M6 1v1.5M6 9.5V11M1 6h1.5M9.5 6H11M2.17 2.17l1.06 1.06M8.77 8.77l1.06 1.06M9.83 2.17l-1.06 1.06M3.23 8.77l-1.06 1.06" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>

      <div className="absolute top-3 right-3 flex flex-col items-end gap-1 no-drag">
        <div className="text-[8px] text-white/20 bg-white/5 rounded px-1.5 py-0.5 border border-white/5">
          ⌘⇧A
        </div>
        {inputMode === 'push-to-talk' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[8px] text-violet-300/30 bg-violet-500/8 rounded px-1.5 py-0.5 border border-violet-400/10"
          >
            Hold Space
          </motion.div>
        )}
      </div>

      <div className="relative no-drag">
        {/* Orbiting particles */}
        <AnimatePresence>
          {(orbState === 'listening' || orbState === 'speaking') && (
            <>
              {Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
                const angle = (i / PARTICLE_COUNT) * 360;
                const radius = 52 + activeLevel * 15;
                const size = orbState === 'speaking' ? 3 + outputLevel * 4 : 2 + audioLevel * 3;
                return (
                  <motion.div
                    key={`particle-${i}`}
                    className={`absolute rounded-full ${
                      orbState === 'speaking' ? 'bg-amber-300/60' : 'bg-violet-300/50'
                    }`}
                    style={{
                      width: size,
                      height: size,
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0.3, 0.8, 0.3],
                      scale: [0.8, 1.2, 0.8],
                      x: Math.cos((angle + Date.now() * 0.03) * (Math.PI / 180)) * radius - size / 2,
                      y: Math.sin((angle + Date.now() * 0.03) * (Math.PI / 180)) * radius - size / 2,
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{
                      opacity: { duration: 1.5 + i * 0.2, repeat: Infinity },
                      scale: { duration: 1.5 + i * 0.2, repeat: Infinity },
                      x: { duration: 0.1 },
                      y: { duration: 0.1 },
                    }}
                  />
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Pulse rings */}
        <AnimatePresence>
          {orbState === 'listening' && audioLevel > 0.05 && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border border-purple-400/40"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-purple-400/30"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-fuchsia-400/20"
                initial={{ scale: 1, opacity: 0.2 }}
                animate={{ scale: [1, 2.5], opacity: [0.2, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.6 }}
              />
            </>
          )}
          {orbState === 'speaking' && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full border border-amber-400/40"
                initial={{ scale: 1, opacity: 0.4 }}
                animate={{ scale: [1, 1.6 + outputLevel], opacity: [0.4, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-orange-300/30"
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: [1, 1.4 + outputLevel * 0.5], opacity: [0.3, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeOut', delay: 0.2 }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border border-yellow-300/20"
                initial={{ scale: 1, opacity: 0.2 }}
                animate={{ scale: [1, 1.8 + outputLevel * 0.8], opacity: [0.2, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
              />
            </>
          )}
          {orbState === 'error' && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-red-400/50"
              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        {/* Ambient glow */}
        <motion.div
          className="absolute inset-[-12px] rounded-full"
          style={{
            background: orbState === 'speaking'
              ? `radial-gradient(circle, rgba(245,158,11,${0.15 + outputLevel * 0.2}) 0%, transparent 70%)`
              : orbState === 'listening'
                ? `radial-gradient(circle, rgba(139,92,246,${0.1 + audioLevel * 0.15}) 0%, transparent 70%)`
                : orbState === 'error'
                  ? 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Main orb */}
        <motion.button
          onClick={handleClick}
          className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${gradients[orbState]} cursor-pointer overflow-hidden`}
          animate={{ scale }}
          style={{ boxShadow: glows[orbState] }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          whileHover={{ scale: scale * 1.05 }}
          whileTap={{ scale: scale * 0.92 }}
        >
          {/* Inner highlight */}
          <motion.div
            className="absolute inset-[6px] rounded-full bg-gradient-to-br from-white/25 to-transparent"
            animate={
              orbState === 'speaking'
                ? { rotate: [0, 360], scale: [0.95, 1.02, 0.95] }
                : orbState === 'connecting'
                  ? { rotate: [0, 360] }
                  : orbState === 'error'
                    ? { scale: [1, 0.95, 1] }
                    : { rotate: 0 }
            }
            transition={
              orbState === 'speaking'
                ? { rotate: { duration: 4, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } }
                : orbState === 'connecting'
                  ? { duration: 2, repeat: Infinity, ease: 'linear' }
                  : orbState === 'error'
                    ? { duration: 2, repeat: Infinity }
                    : {}
            }
          />

          {/* Waveform bars */}
          {(orbState === 'listening' || orbState === 'speaking') && (
            <div className="absolute inset-0 flex items-center justify-center gap-[3px]">
              {freqBands.map((level, i) => (
                <motion.div
                  key={i}
                  className={`w-[2.5px] rounded-full ${
                    orbState === 'speaking' ? 'bg-white/50' : 'bg-white/40'
                  }`}
                  animate={{
                    height: Math.max(4, level * 28),
                  }}
                  transition={{ duration: 0.08, ease: 'linear' }}
                />
              ))}
            </div>
          )}

          {/* Breathing border */}
          <motion.div
            className="absolute inset-0 rounded-full border border-white/20"
            animate={
              orbState === 'idle'
                ? { scale: [1, 1.02, 1], opacity: [0.3, 0.6, 0.3] }
                : { scale: 1, opacity: 0.3 }
            }
            transition={
              orbState === 'idle'
                ? { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                : {}
            }
          />

          {/* Center indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            {orbState === 'error' ? (
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-white/70">
                  <path d="M8 4v5M8 11v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </motion.div>
            ) : orbState === 'idle' ? (
              <motion.div
                className="w-2 h-2 rounded-full bg-white/40"
                animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            ) : orbState === 'connecting' ? (
              <motion.div
                className="w-2 h-2 rounded-full bg-white/60"
                animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            ) : null}
          </div>
        </motion.button>
      </div>

      {/* Status label */}
      <motion.p
        className="text-[10px] uppercase tracking-widest text-white/40 no-drag"
        animate={{ opacity: status === 'disconnected' ? 0.4 : 0.7 }}
      >
        {orbState === 'idle' && (inputMode === 'push-to-talk' ? 'Hold Space' : 'Click to start')}
        {orbState === 'connecting' && 'Connecting...'}
        {orbState === 'listening' && 'Listening'}
        {orbState === 'speaking' && 'Speaking'}
        {orbState === 'error' && (retryCount < 3 ? 'Reconnecting...' : 'Click to retry')}
      </motion.p>

      {/* Error detail */}
      <AnimatePresence>
        {orbState === 'error' && errorMsg && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[9px] text-red-300/60 text-center max-w-[200px] no-drag"
          >
            {errorMsg}
          </motion.p>
        )}
      </AnimatePresence>

      <Transcription />
      <ActionFeedback />
      <ConversationHistory isOpen={showHistory} onClose={() => setShowHistory(false)} />
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        inputMode={inputMode}
        onInputModeChange={handleInputModeChange}
        theme={theme}
      />
    </div>
  );
}
