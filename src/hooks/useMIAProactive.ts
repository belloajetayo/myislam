import { useEffect, useState, useCallback } from "react";
import {
  computeProactive,
  isSeen,
  markSeen as markSeenStorage,
  type ProactiveMessage,
} from "@/lib/miaProactive";

/**
 * Watches for a pending proactive MIA message. The dot shows when there is
 * a computed message that the user hasn't acknowledged yet.
 * Re-checks every 60s and when the tab becomes visible.
 */
export function useMIAProactive() {
  const [message, setMessage] = useState<ProactiveMessage | null>(null);

  const refresh = useCallback(() => {
    const m = computeProactive();
    if (m && !isSeen(m.id)) {
      setMessage(m);
    } else {
      setMessage(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = window.setInterval(refresh, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const markSeen = useCallback(
    (id: string) => {
      markSeenStorage(id);
      refresh();
    },
    [refresh],
  );

  return { pending: !!message, message, markSeen };
}
