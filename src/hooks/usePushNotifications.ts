import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { resolveExactLocation, saveLastLocation } from "@/hooks/useExactLocation";

const VAPID_PUBLIC_KEY = "BGNiIskKFEbs4Fpzoi-F_-_n1D7BNGTVGldFCJd8k0XItL27r6DPrU9wogKC29342IPwkXy0YsS-r3YecBtVX3w";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

async function savePushSubscriptionToDb(
  userId: string,
  subscription: PushSubscriptionJSON,
  latitude: number,
  longitude: number,
  timezone: string,
) {
  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error("Invalid push subscription payload");
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
      latitude,
      longitude,
      timezone,
    },
    { onConflict: "user_id,endpoint" },
  );

  if (error) {
    throw error;
  }
}

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      checkSubscription();
    } else {
      setIsLoading(false);
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      }
    } catch (e) {
      console.error("Error checking push subscription:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const subscribe = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // Check auth
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.error("User must be logged in for push notifications");
        toast.error("Please sign in to enable push notifications.");
        return false;
      }

      // Register the push service worker
      const registration = await navigator.serviceWorker.register("/push-sw.js", { scope: "/" });

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return false;

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });

      const subJson = subscription.toJSON();
      if (!subJson.keys?.p256dh || !subJson.keys?.auth || !subJson.endpoint) {
        throw new Error("Unable to read push subscription keys");
      }

      // Resolve the best available exact location for this user.
      const resolvedLocation = await resolveExactLocation({ allowBrowser: true, preferCache: true });
      saveLastLocation(resolvedLocation);
      const lat = resolvedLocation.latitude;
      const lon = resolvedLocation.longitude;

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      await savePushSubscriptionToDb(
        session.user.id,
        subJson,
        lat,
        lon,
        timezone,
      );

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("Push subscription failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      const registration = await navigator.serviceWorker.getRegistration("/push-sw.js");
      if (registration) {
        const sub = await registration.pushManager.getSubscription();
        if (sub) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("user_id", session.user.id)
              .eq("endpoint", sub.endpoint);
          }
          await sub.unsubscribe();
        }
      }
      setIsSubscribed(false);
      return true;
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    if (isSubscribed) return unsubscribe();
    return subscribe();
  }, [isSubscribed, subscribe, unsubscribe]);

  return { isSubscribed, isSupported, isLoading, subscribe, unsubscribe, toggle };
}
