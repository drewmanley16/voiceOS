import { useConversation } from '@elevenlabs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface Message {
  id: number;
  text: string;
  source: 'user' | 'agent';
  timestamp: number;
}

export function Transcription() {
  const { message } = useConversation();
  const [messages, setMessages] = useState<Message[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!message) return;

    const newMsg: Message = {
      id: idRef.current++,
      text: message,
      source: 'agent',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev.slice(-2), newMsg]);

    const timer = setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
    }, 8000);

    return () => clearTimeout(timer);
  }, [message]);

  return (
    <div className="flex flex-col items-center gap-1.5 max-w-[260px] no-drag">
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            layout
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-full"
          >
            <p className="text-[11px] text-white/80 bg-black/40 backdrop-blur-md rounded-xl px-3 py-2 leading-relaxed text-center">
              {msg.text}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
