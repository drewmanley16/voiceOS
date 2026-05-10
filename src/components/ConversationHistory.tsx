import { useConversation } from '@elevenlabs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

interface HistoryMessage {
  id: number;
  text: string;
  source: 'user' | 'agent';
  timestamp: number;
}

interface ConversationHistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConversationHistory({ isOpen, onClose }: ConversationHistoryProps) {
  const conversation = useConversation();
  const [messages, setMessages] = useState<HistoryMessage[]>([]);
  const idRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversation.message) return;

    const newMsg: HistoryMessage = {
      id: idRef.current++,
      text: conversation.message,
      source: conversation.isSpeaking ? 'agent' : 'user',
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
  }, [conversation.message]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-xl no-drag"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400" />
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider">History</span>
              <span className="text-[10px] text-white/30">{messages.length} messages</span>
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

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <p className="text-[10px] text-white/30">No messages yet</p>
              </div>
            ) : (
              messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex flex-col gap-0.5 ${msg.source === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                    msg.source === 'user'
                      ? 'bg-violet-500/20 border border-violet-400/15'
                      : 'bg-white/8 border border-white/8'
                  }`}>
                    <p className="text-[11px] text-white/80 leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[8px] text-white/20 px-1">
                    {msg.source === 'agent' ? 'Aura' : 'You'} · {formatTime(msg.timestamp)}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
