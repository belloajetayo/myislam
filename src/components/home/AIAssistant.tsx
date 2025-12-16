import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2 } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const chatRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "What is today's Islamic wisdom?",
    "Tell me about the 5 pillars",
    "How to perform Wudu?",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim());
    setInput('');
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="glass rounded-3xl p-4 shadow-card border border-primary/10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 gradient-accent rounded-2xl flex items-center justify-center shadow-soft">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-gradient-gold text-sm">Islamic AI Assistant</h3>
          <p className="text-xs text-primary-foreground/70">Ask me anything about Islam</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {messages.length > 0 && (
            <button 
              onClick={clearMessages}
              className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 text-primary-foreground/60" />
            </button>
          )}
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-islamic-green rounded-full animate-pulse" />
            <span className="text-xs text-primary-foreground/70">Online</span>
          </div>
        </div>
      </div>

      {/* Chat Display */}
      <div 
        ref={chatRef}
        className="bg-muted/30 rounded-2xl p-3 mb-3 min-h-[100px] max-h-[200px] overflow-y-auto space-y-3"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-primary-foreground/80">
            Assalamu Alaikum! 🌙 I'm here to help you on your spiritual journey. 
            Ask me about prayers, Qur'an, or any Islamic guidance.
          </p>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-2.5 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-primary/20 text-primary-foreground ml-4' 
                  : 'bg-muted/50 text-primary-foreground/90 mr-4'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="bg-muted/50 p-2.5 rounded-2xl">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-primary-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-primary-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-primary-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {messages.length === 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => sendMessage(suggestion)}
              className="flex-shrink-0 px-3 py-1.5 bg-primary/10 text-primary-foreground text-xs rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-muted/30 rounded-2xl px-4 py-2.5 border border-primary-foreground/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none"
          />
        </div>
        <button 
          type="submit"
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
