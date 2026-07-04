import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getUserName } from '@/lib/miaProactive';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const MIA_CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mia-chat`;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const useMIAChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const { toast } = useToast();

  // Load previous chat history on mount
  useEffect(() => {
    const loadHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('chat_messages')
        .select('role, content')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true })
        .limit(100);

      if (!error && data && data.length > 0) {
        setMessages(data.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })));
      }
      setHistoryLoaded(true);
    };

    loadHistory();
  }, []);

  // Persist a message to the database
  const persistMessage = async (msg: Message) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    await supabase.from('chat_messages').insert({
      user_id: session.user.id,
      role: msg.role,
      content: msg.content,
    });
  };

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Persist user message
    persistMessage(userMessage);

    let assistantContent = '';

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) => 
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantContent }];
      });
    };

    // Build companion context from cached app state
    const buildContext = () => {
      const ctx: Record<string, unknown> = {
        nowISO: new Date().toISOString(),
        localTime: new Date().toLocaleString(),
        weekday: new Date().toLocaleDateString("en", { weekday: "long" }),
      };
      try {
        const progRaw = localStorage.getItem("mia_user_progress");
        if (progRaw) {
          const p = JSON.parse(progRaw);
          ctx.streakDays = p.streak ?? 0;
          ctx.prayersCompletedToday = p.prayersCompleted ?? [];
          ctx.quranPagesToday = p.quranPagesRead ?? 0;
          ctx.duasToday = p.duasRead ?? 0;
        }
      } catch { /* ignore */ }
      try {
        const ptRaw = localStorage.getItem("prayer_times_cache_v1");
        if (ptRaw) {
          const pt = JSON.parse(ptRaw);
          ctx.prayerTimes = pt.prayerTimes;
          ctx.hijriDate = pt.hijriDate;
          ctx.location = pt.location ? { city: pt.location.city, country: pt.location.country } : null;
        }
      } catch { /* ignore */ }
      return ctx;
    };

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('Please sign in to use MIA Assistant');
      }

      const response = await fetch(MIA_CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: [...messages, userMessage], context: buildContext() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) updateAssistant(content);
          } catch { /* ignore */ }
        }
      }

      // Persist the complete assistant response
      if (assistantContent) {
        persistMessage({ role: 'assistant', content: assistantContent });
      }
    } catch (error) {
      console.error('MIA chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, toast]);

  const clearMessages = useCallback(async () => {
    // Delete from database too
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', session.user.id);
    }
    setMessages([]);
  }, []);

  const openWithQuestion = useCallback((question: string) => {
    setIsOpen(true);
    setTimeout(() => {
      sendMessage(question);
    }, 100);
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    isOpen,
    setIsOpen,
    sendMessage,
    clearMessages,
    openWithQuestion,
    historyLoaded,
  };
};
