import React, { useState } from 'react';
import { Sparkles, Send, Mic } from 'lucide-react';

const AIAssistant: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestions = [
    "What is today's Islamic wisdom?",
    "Help me track my prayers",
    "Remind me about Zakat",
  ];

  return (
    <div className="glass rounded-3xl p-4 shadow-card border border-primary/10 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 gradient-accent rounded-2xl flex items-center justify-center shadow-soft">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground text-sm">Islamic AI Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask me anything about Islam</p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <span className="w-2 h-2 bg-islamic-green rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Chat Display */}
      <div className="bg-muted/50 rounded-2xl p-3 mb-3 min-h-[60px]">
        <p className="text-sm text-foreground">
          Assalamu Alaikum! 🌙 I'm here to help you on your spiritual journey. 
          Ask me about prayers, Qur'an, or any Islamic guidance.
        </p>
      </div>

      {/* Quick Suggestions */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setMessage(suggestion)}
            className="flex-shrink-0 px-3 py-1.5 bg-primary/10 text-primary text-xs rounded-full hover:bg-primary/20 transition-colors border border-primary/20"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-muted/50 rounded-2xl px-4 py-2.5 border border-border/50">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Mic className="w-4 h-4" />
          </button>
        </div>
        <button className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-soft hover:scale-105 transition-transform">
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;
