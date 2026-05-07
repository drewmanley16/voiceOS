import { motion, AnimatePresence } from 'framer-motion';
import {
  useConversationControls,
  useConversationStatus,
  useConversationMode,
} from '@elevenlabs/react';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Transcription } from './Transcription';
import { ActionFeedback } from './ActionFeedback';

const AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

type OrbState = 'idle' | 'connecting' | 'listening' | 'speaking';

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

  useEffect(() => {
    if (status === 'disconnected') {
      setOrbState('idle');
    } else if (status === 'connecting') {
      setOrbState('connecting');
    } else if (status === 'connected') {
      setOrbState(isSpeaking ? 'speaking' : 'listening');
    }
  }, [status, isSpeaking]);

  useEffect(() => {
    if (status !== 'connected') return;

    const updateAudio = () => {
      const inputData = getInputByteFrequencyData();
      if (inputData && inputData.length > 0) {
        const avg = inputData.reduce((sum: number, val: number) => sum + val, 0) / inputData.length;
        setAudioLevel(avg / 255);
      }

      const outputData = getOutputByteFrequencyData();
      if (outputData && outputData.length > 0) {
        const avg = outputData.reduce((sum: number, val: number) => sum + val, 0) / outputData.length;
        setOutputLevel(avg / 255);
      }

      animFrameRef.current = requestAnimationFrame(updateAudio);
    };

    animFrameRef.current = requestAnimationFrame(updateAudio);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [status, getInputByteFrequencyData, getOutputByteFrequencyData]);

  const handleClick = useCallback(async () => {
    if (status === 'connected') {
      await endSession();
      setHasStarted(false);
    } else if (status === 'disconnected' && AGENT_ID) {
      await startSession({ agentId: AGENT_ID });
      setHasStarted(true);
    }
  }, [status, startSession, endSession]);

  useEffect(() => {
    if (AGENT_ID && status === 'disconnected' && !hasStarted) {
      const timer = setTimeout(() => {
        startSession({ agentId: AGENT_ID });
        setHasStarted(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const activeLevel = orbState === 'speaking' ? outputLevel : audioLevel;
  const scale = 1 + activeLevel * 0.12;

  const gradients: Record<OrbState, string> = {
    idle: 'from-indigo-600 via-purple-600 to-blue-700',
    connecting: 'from-purple-500 via-indigo-500 to-blue-500',
    listening: 'from-violet-500 via-purple-500 to-fuchsia-500',
    speaking: 'from-amber-400 via-orange-400 to-yellow-500',
  };

  const glows: Record<OrbState, string> = {
    idle: '0 0 30px rgba(99,102,241,0.3), 0 0 60px rgba(99,102,241,0.1)',
    connecting: '0 0 40px rgba(139,92,246,0.4), 0 0 80px rgba(139,92,246,0.15)',
    listening: '0 0 50px rgba(139,92,246,0.5), 0 0 100px rgba(139,92,246,0.2)',
    speaking: '0 0 60px rgba(245,158,11,0.5), 0 0 120px rgba(245,158,11,0.2)',
  };

  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <div className="relative no-drag">
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
            </>
          )}
        </AnimatePresence>

        {/* Main orb */}
        <motion.button
          onClick={handleClick}
          className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${gradients[orbState]} cursor-pointer`}
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
                  : { rotate: 0 }
            }
            transition={
              orbState === 'speaking'
                ? { rotate: { duration: 4, repeat: Infinity, ease: 'linear' }, scale: { duration: 1.5, repeat: Infinity } }
                : orbState === 'connecting'
                  ? { duration: 2, repeat: Infinity, ease: 'linear' }
                  : {}
            }
          />

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

          {/* Center dot indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className={`w-2 h-2 rounded-full ${
                orbState === 'idle' ? 'bg-white/40' :
                orbState === 'connecting' ? 'bg-white/60' :
                orbState === 'listening' ? 'bg-white/70' :
                'bg-white/80'
              }`}
              animate={
                orbState === 'connecting'
                  ? { scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }
                  : orbState === 'listening'
                    ? { scale: [1, 1 + audioLevel * 2, 1] }
                    : {}
              }
              transition={
                orbState === 'connecting'
                  ? { duration: 1, repeat: Infinity }
                  : { duration: 0.1 }
              }
            />
          </div>
        </motion.button>
      </div>

      {/* Status label */}
      <motion.p
        className="text-[10px] uppercase tracking-widest text-white/40 no-drag"
        animate={{ opacity: status === 'disconnected' ? 0.4 : 0.7 }}
      >
        {orbState === 'idle' && 'Click to start'}
        {orbState === 'connecting' && 'Connecting...'}
        {orbState === 'listening' && 'Listening'}
        {orbState === 'speaking' && 'Speaking'}
      </motion.p>

      <Transcription />
      <ActionFeedback />
    </div>
  );
}
