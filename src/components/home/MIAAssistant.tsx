import React, { useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Trash2, X, Clock, BookOpen, Heart, Compass, ArrowRight, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { getUserName, setUserName } from '@/lib/miaProactive';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const SUGGESTED_QUESTIONS = [
  "What should I do right now?",
  "How's my streak — what's my next step?",
  "What's special about today?",
  "Suggest an adhkar for now",
];

type QuickAction = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  match: RegExp;
  gradient: string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    key: 'prayer',
    label: 'Prayer Times',
    icon: Clock,
    route: '/prayer',
    match: /\b(pray(er)?|salah|salat|adhan|fajr|dhuhr|zuhr|asr|maghrib|isha|jumu'?ah)\b/i,
    gradient: 'from-violet-500 to-fuchsia-500',
  },
  {
    key: 'quran',
    label: "Qur'an Reader",
    icon: BookOpen,
    route: '/quran',
    match: /\b(qur'?an|surah|ayah|ayat|recite|mushaf|tilawah)\b/i,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    key: 'dua',
    label: 'Duas',
    icon: Heart,
    route: '/duas',
    match: /\b(du'?a|dua|adhkar|dhikr|supplication|remembrance)\b/i,
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    key: 'qiblah',
    label: 'Qiblah',
    icon: Compass,
    route: '/qiblah',
    match: /\b(qibla|qiblah|kaaba|ka'?bah|direction|compass)\b/i,
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    key: 'fasting',
    label: 'Fasting',
    icon: Utensils,
    route: '/fasting',
    match: /\b(fast(ing)?|sawm|suhoor|iftar|ramadan|white days|ayy?am al-b[iī]d)\b/i,
    gradient: 'from-sky-500 to-cyan-500',
  },
];

interface MIAAssistantProps {
  messages: Message[];
  isLoading: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  onClearMessages: () => void;
}

const detectActions = (text: string): QuickAction[] => {
  return QUICK_ACTIONS.filter((a) => a.match.test(text));
};

const MIAAssistant: React.FC<MIAAssistantProps> = ({
  messages,
  isLoading,
  isOpen,
  onClose,
  onSendMessage,
  onClearMessages,
}) => {
  const [input, setInput] = React.useState('');
  const [nameDraft, setNameDraft] = React.useState('');
  const [needsName, setNeedsName] = React.useState<boolean>(() => !getUserName());
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) setNeedsName(!getUserName());
  }, [isOpen]);

  const submitName = (e: React.FormEvent) => {
    e.preventDefault();
    const v = nameDraft.trim();
    if (!v) return;
    setUserName(v);
    setNeedsName(false);
    setNameDraft('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const goTo = (route: string) => {
    onClose();
    navigate(route);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden bg-gradient-to-b from-[#3d1a78] via-[#5b2ca8] to-[#7c3aed] shadow-2xl sm:h-[85vh] sm:max-h-[720px] sm:rounded-[32px]">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-fuchsia-400/30 blur-3xl" />
        <div className="pointer-events-none absolute -top-10 right-0 h-48 w-48 rounded-full bg-violet-300/20 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur">
              <img
                src="/__l5e/assets-v1/4e726eb6-b18f-4122-bd0f-db8e93e45e65/myislam-logo.png"
                alt="MIA"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="text-white">
              <h3 className="text-base font-semibold leading-tight">MIA</h3>
              <p className="text-[11px] font-medium text-white/70">Your Islamic Companion</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={onClearMessages}
                className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick action pills always visible */}
        <div className="relative px-5 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {QUICK_ACTIONS.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.key}
                  onClick={() => goTo(a.route)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-r ${a.gradient} px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-black/20 ring-1 ring-white/20 transition active:scale-95`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="relative flex-1 px-5" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="space-y-5 py-4">
              <div className="rounded-3xl bg-white/10 p-5 text-white ring-1 ring-white/15 backdrop-blur">
                <p className="text-lg font-semibold">Assalamu Alaikum 👋</p>
                <p className="mt-1 text-sm text-white/80">
                  I know your streak, next prayer, and the Hijri date. Ask me what to do right now — or tap a shortcut above.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">Try asking</p>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(q)}
                    className="flex w-full items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-left text-sm text-white ring-1 ring-white/10 transition hover:bg-white/15"
                  >
                    <span>{q}</span>
                    <ArrowRight className="h-4 w-4 text-white/60" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                const actions = !isUser ? detectActions(msg.content + ' ' + (messages[idx - 1]?.content || '')) : [];
                return (
                  <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-2`}>
                      <div
                        className={
                          isUser
                            ? 'rounded-2xl rounded-br-md bg-white px-4 py-2.5 text-sm text-[#3d1a78] shadow-md'
                            : 'rounded-2xl rounded-bl-md bg-white/15 px-4 py-2.5 text-sm text-white ring-1 ring-white/10 backdrop-blur'
                        }
                      >
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        ) : (
                          <div className="prose prose-sm prose-invert max-w-none leading-relaxed [&_*]:text-white">
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      {actions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {actions.map((a) => {
                            const Icon = a.icon;
                            return (
                              <button
                                key={a.key}
                                onClick={() => goTo(a.route)}
                                className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${a.gradient} px-3 py-1.5 text-xs font-semibold text-white shadow-md ring-1 ring-white/25 transition active:scale-95`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                Open {a.label}
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-white/15 px-4 py-3 ring-1 ring-white/10 backdrop-blur">
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white delay-100" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-white delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSubmit} className="relative px-4 pb-5 pt-3">
          <div className="flex items-end gap-2 rounded-3xl bg-white/95 p-2 shadow-xl ring-1 ring-white/40">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask MIA anything…"
              className="min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent text-[15px] text-[#3d1a78] placeholder:text-[#7c5fbf] focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg hover:opacity-95 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-white/60">
            Responses are AI-generated. Always verify with qualified scholars.
          </p>
        </form>
      </div>
    </div>
  );
};

export default MIAAssistant;
