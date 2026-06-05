import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Prayer from "./pages/Prayer";
import Qiblah from "./pages/Qiblah";
import Quran from "./pages/Quran";

import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Zakat from "./pages/Zakat";
import Fasting from "./pages/Fasting";
import Hajj from "./pages/Hajj";
import Donate from "./pages/Donate";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { AudioProvider } from "./context/AudioContext";
import { LocationProvider } from "./context/LocationContext";

const queryClient = new QueryClient();

// ── Adhan playback ────────────────────────────────────────────────────────────
//
// Background: browser autoplay policy prevents audio.play() unless there has
// been a user gesture on the page. A service-worker postMessage() is NOT a
// user gesture. The notification *tap*, however, brings the page to focus and
// Chrome/Android does grant a transient user activation at that point.
//
// Strategy (three-tier, in order of reliability):
//
//   1. ?playAdhan=1 URL param  — set by push-sw.js when it must open a NEW
//      window for the notification. The page loads fresh; the OS tap that
//      opened it counts as activation on most Android browsers.
//
//   2. postMessage PLAY_ADHAN_FROM_NOTIFICATION — sent by push-sw.js when it
//      focuses an EXISTING tab. Chrome Android grants activation on focus()
//      from notificationclick, so this usually succeeds immediately.
//
//   3. visibilitychange / focus fallback — if both above fail (e.g. iOS), we
//      store a pending-adhan flag and watch for the page becoming visible.
//      The FIRST time the user touches or clicks the page after it becomes
//      visible (guaranteed user gesture), the adhan plays.
//
// Note: it is impossible to play audio while the browser is fully closed or
// while the app is in the background — that is a platform limitation of all
// web browsers. The OS notification sound (the default ping) still plays.
// Only the custom adhan can only play once the user opens/focuses the app.
// ─────────────────────────────────────────────────────────────────────────────

const PENDING_KEY = "adhan_pending_ts";
const PENDING_TTL = 10 * 60 * 1000; // 10 minutes — ignore stale flags

function setPendingAdhan() {
  try { sessionStorage.setItem(PENDING_KEY, String(Date.now())); } catch { /* quota */ }
}

function clearPendingAdhan() {
  try { sessionStorage.removeItem(PENDING_KEY); } catch { /* quota */ }
}

function hasPendingAdhan(): boolean {
  try {
    const ts = Number(sessionStorage.getItem(PENDING_KEY) ?? "0");
    return ts > 0 && Date.now() - ts < PENDING_TTL;
  } catch { return false; }
}

async function attemptPlay(): Promise<boolean> {
  const { playAdhan } = await import("./lib/adhanPlayer");
  return playAdhan();
}

async function playNotificationAdhan() {
  const played = await attemptPlay();
  if (!played) {
    // Autoplay was blocked. Store a flag; a visibilitychange / focus listener
    // will retry the moment the user interacts with the page.
    setPendingAdhan();
  } else {
    clearPendingAdhan();
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

const App = () => {
  useEffect(() => {
    // ── Tier 1: Fresh page open from notification (?playAdhan=1) ──────────────
    const playFromUrl =
      new URLSearchParams(window.location.search).get("playAdhan") === "1";
    if (playFromUrl) {
      const url = new URL(window.location.href);
      url.searchParams.delete("playAdhan");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      // Tiny delay so React finishes mounting; the OS tap still counts as
      // the activation context during this micro-task window.
      setTimeout(() => void playNotificationAdhan(), 100);
    }

    // ── Check for a pending adhan from a previous session ────────────────────
    if (hasPendingAdhan()) {
      void playNotificationAdhan();
    }

    if (!("serviceWorker" in navigator)) return;

    // ── Tier 2: postMessage from notificationclick (focused existing tab) ─────
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "PLAY_ADHAN_FROM_NOTIFICATION") {
        void playNotificationAdhan();
      }
    };
    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);

    // ── Tier 3: visibilitychange + focus fallback ─────────────────────────────
    // If playNotificationAdhan stored a pending flag, retry on the next time
    // the document becomes visible (covers app-switcher → app, or notification
    // tap → already-open page on browsers that don't grant activation).
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && hasPendingAdhan()) {
        void playNotificationAdhan();
      }
    };
    const handleFocus = () => {
      if (hasPendingAdhan()) {
        void playNotificationAdhan();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AudioProvider>
          <LocationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/prayer" element={<Prayer />} />
                <Route path="/qiblah" element={<Qiblah />} />
                <Route path="/quran" element={<Quran />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/zakat" element={<Zakat />} />
                <Route path="/fasting" element={<Fasting />} />
                <Route path="/hajj" element={<Hajj />} />
                <Route path="/donation" element={<Donate />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </LocationProvider>
        </AudioProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
