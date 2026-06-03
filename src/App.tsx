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

const playNotificationAdhan = async () => {
  const { playAdhan } = await import("./lib/adhanPlayer");
  await playAdhan();
};

const App = () => {
  useEffect(() => {
    const playFromUrl = new URLSearchParams(window.location.search).get("playAdhan") === "1";
    if (playFromUrl) {
      const url = new URL(window.location.href);
      url.searchParams.delete("playAdhan");
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
      void playNotificationAdhan();
    }

    if (!("serviceWorker" in navigator)) return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === "PLAY_ADHAN_FROM_NOTIFICATION") {
        void playNotificationAdhan();
      }
    };

    navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
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
