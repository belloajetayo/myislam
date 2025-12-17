import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, X, Maximize2, MessageCircle } from 'lucide-react';
import { useAIChat } from '@/hooks/useAIChat';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { messages, isLoading, sendMessage, clearMessages } = useAIChat();
  const chatRef = useRef<HTMLDivElement>(null);

  const suggestions = [
    "What is today's Islamic wisdom?",
    "Tell me about the 5 pillars",
    "How to perform Wudu?",
    "Best duas for morning",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    if (!isExpanded) setIsExpanded(true);
    sendMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setIsExpanded(true);
    sendMessage(suggestion);
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const ChatContent = ({ inModal = false }: { inModal?: boolean }) => (
    <div className={`flex flex-col ${inModal ? 'h-full' : ''}`}>
      {/* Chat Messages */}
      <div 
        ref={chatRef}
        className={`flex-1 overflow-y-auto space-y-4 p-4 ${inModal ? 'min-h-[400px] max-h-[60vh]' : 'min-h-[120px] max-h-[200px]'}`}
      >
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-lg font-semibold bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 bg-clip-text text-transparent mb-2">
              Assalamu Alaikum! 🌙
            </h4>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              I'm your Islamic guide. Ask me about prayers, Qur'an, Hadith, or any Islamic guidance.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white ml-4 shadow-md' 
                  : 'bg-card border border-border text-foreground mr-4 shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border p-3 rounded-2xl shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Suggestions */}
      {messages.length === 0 && (
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex-shrink-0 px-3 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-foreground text-xs rounded-full hover:from-amber-500/20 hover:to-orange-500/20 transition-all border border-amber-500/20 hover:border-amber-500/40"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-background rounded-2xl px-4 py-3 border border-border focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Islam..."
              disabled={isLoading}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Compact Card View */}
      <div className="relative overflow-hidden rounded-3xl shadow-xl border border-amber-500/20 animate-fade-in">
        {/* Gold gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-600/10" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-400/20 to-transparent rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-2xl" />
        
        <div className="relative bg-card/80 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-border/50">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-orange-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base bg-gradient-to-r from-amber-400 via-orange-500 to-purple-600 bg-clip-text text-transparent">
                Islamic AI Guide
              </h3>
              <p className="text-xs text-muted-foreground">Quran • Hadith • IslamQA</p>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <>
                  <button 
                    onClick={clearMessages}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button 
                    onClick={() => setIsExpanded(true)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                    title="Expand chat"
                  >
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                </>
              )}
              <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
            </div>
          </div>

          <ChatContent />
        </div>
      </div>

      {/* Expanded Modal View */}
      <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
        <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden border-amber-500/20">
          {/* Modal Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600" />
            <div className="relative flex items-center gap-3 p-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">Islamic AI Guide</h3>
                <p className="text-xs text-white/80">Powered by Quran, Hadith & IslamQA</p>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button 
                    onClick={clearMessages}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Clear chat"
                  >
                    <Trash2 className="w-5 h-5 text-white/80" />
                  </button>
                )}
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Modal Chat Content */}
          <div className="bg-background">
            <ChatContent inModal />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AIAssistant;
