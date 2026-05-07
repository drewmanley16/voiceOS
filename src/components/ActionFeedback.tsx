import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ActionEvent {
  action: string;
  timestamp: number;
}

export function ActionFeedback() {
  const [action, setAction] = useState<ActionEvent | null>(null);

  useEffect(() => {
    const handler = (event: CustomEvent<{ action: string }>) => {
      setAction({ action: event.detail.action, timestamp: Date.now() });
      setTimeout(() => setAction(null), 3000);
    };

    window.addEventListener('aura-action', handler as EventListener);
    return () => window.removeEventListener('aura-action', handler as EventListener);
  }, []);

  return (
    <AnimatePresence>
      {action && (
        <motion.div
          key={action.timestamp}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full no-drag"
        >
          <motion.div
            className="w-2 h-2 rounded-full bg-cyan-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.6, repeat: Infinity }}
          />
          <span className="text-[10px] text-white/60 uppercase tracking-wider">
            {action.action}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
