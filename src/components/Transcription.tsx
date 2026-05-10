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
  const conversation = useConversation();
  const [messages, setMessages] = useState<Message[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (!conversation.message) return;

    const newMsg: Message = {
      id: idRef.current++,
      text: conversation.message,
      source: conversation.isSpeaking ? 'agent' : 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev.slice(-3), newMsg]);

    const timer = setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
    }, 10000);

    return () => clearTimeout(timer);
  }, [conversation.message]);

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
            <div className={`flex items-start gap-1.5 ${msg.source === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.source === 'agent' && (
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex-shrink-0 mt-0.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                </div>
              )}
              <p className={`text-[11px] backdrop-blur-md rounded-xl px-3 py-2 leading-relaxed ${
                msg.source === 'user'
                  ? 'bg-white/15 text-white/70 text-right'
                  : 'bg-black/40 text-white/90 text-left'
              }`}>
                {msg.text}
              </p>
              {msg.source === 'user' && (
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0 mt-0.5 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
