import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ActionEvent {
  action: string;
  timestamp: number;
}

const ACTION_ICONS: Record<string, { icon: string; color: string }> = {
  'open application':   { icon: '🚀', color: 'from-blue-400/20 to-blue-500/10' },
  'search files':       { icon: '🔍', color: 'from-cyan-400/20 to-cyan-500/10' },
  'get calendar events':{ icon: '📅', color: 'from-green-400/20 to-green-500/10' },
  'create calendar event':{ icon: '📅', color: 'from-green-400/20 to-green-500/10' },
  'send email':         { icon: '✉️', color: 'from-red-400/20 to-red-500/10' },
  'control music':      { icon: '🎵', color: 'from-pink-400/20 to-pink-500/10' },
  'set system volume':  { icon: '🔊', color: 'from-purple-400/20 to-purple-500/10' },
  'take screenshot':    { icon: '📸', color: 'from-amber-400/20 to-amber-500/10' },
  'open url':           { icon: '🌐', color: 'from-indigo-400/20 to-indigo-500/10' },
  'web search':         { icon: '🔎', color: 'from-indigo-400/20 to-indigo-500/10' },
  'create note':        { icon: '📝', color: 'from-yellow-400/20 to-yellow-500/10' },
  'get weather':        { icon: '🌤️', color: 'from-sky-400/20 to-sky-500/10' },
  'set timer':          { icon: '⏱️', color: 'from-orange-400/20 to-orange-500/10' },
  'get notifications':  { icon: '🔔', color: 'from-rose-400/20 to-rose-500/10' },
  'send notification':  { icon: '🔔', color: 'from-rose-400/20 to-rose-500/10' },
  'capture screen':     { icon: '👁️', color: 'from-emerald-400/20 to-emerald-500/10' },
  'get active window':  { icon: '🪟', color: 'from-teal-400/20 to-teal-500/10' },
};

const DEFAULT_ACTION = { icon: '⚡', color: 'from-white/10 to-white/5' };

export function ActionFeedback() {
  const [action, setAction] = useState<ActionEvent | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    const handler = (event: CustomEvent<{ action: string; result?: string }>) => {
      setAction({ action: event.detail.action, timestamp: Date.now() });
      setResult(null);
      setTimeout(() => setAction(null), 4000);
    };

    const resultHandler = (event: CustomEvent<{ action: string; result: string }>) => {
      setResult(event.detail.result);
    };

    window.addEventListener('aura-action', handler as EventListener);
    window.addEventListener('aura-action-result', resultHandler as EventListener);
    return () => {
      window.removeEventListener('aura-action', handler as EventListener);
      window.removeEventListener('aura-action-result', resultHandler as EventListener);
    };
  }, []);

  if (!action) return null;

  const match = ACTION_ICONS[action.action] || DEFAULT_ACTION;

  return (
    <AnimatePresence>
      {action && (
        <motion.div
          key={action.timestamp}
          initial={{ opacity: 0, y: 6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.9 }}
          className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${match.color} backdrop-blur-md rounded-2xl border border-white/10 no-drag max-w-[240px]`}
        >
          <span className="text-sm flex-shrink-0">{match.icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] text-white/70 uppercase tracking-wider truncate">
              {action.action}
            </span>
            {result ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[9px] text-white/40 truncate"
              >
                {result}
              </motion.span>
            ) : (
              <div className="flex gap-0.5 mt-0.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1 h-1 rounded-full bg-white/40"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
