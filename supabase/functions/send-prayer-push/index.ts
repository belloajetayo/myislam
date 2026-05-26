/// <reference lib="deno.ns" />
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;

// Web Push requires signing JWTs with ES256 (P-256 / ECDSA)
async function importVapidPrivateKey(base64url: string): Promise<CryptoKey> {
  const rawPriv = base64urlToUint8Array(base64url);
  const rawPub = base64urlToUint8Array(VAPID_PUBLIC_KEY);

  if (rawPub.length !== 65 || rawPub[0] !== 0x04) {
    throw new Error("Invalid VAPID public key format. Expected uncompressed P-256 key (65 bytes starting with 0x04).");
  }

  const jwk = {
    kty: "EC",
    crv: "P-256",
    x: uint8ArrayToBase64url(rawPub.slice(1, 33)),
    y: uint8ArrayToBase64url(rawPub.slice(33, 65)),
    d: uint8ArrayToBase64url(rawPriv),
  };
  return crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
}

function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function uint8ArrayToBase64url(arr: Uint8Array): string {
  let binary = "";
  for (const b of arr) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createVapidJwt(audience: string, privateKey: CryptoKey): Promise<string> {
  const header = { typ: "JWT", alg: "ES256" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400,
    sub: "mailto:push@myislam.lovable.app",
  };
  const enc = new TextEncoder();
  const headerB64 = uint8ArrayToBase64url(enc.encode(JSON.stringify(header)));
  const payloadB64 = uint8ArrayToBase64url(enc.encode(JSON.stringify(payload)));
  const input = enc.encode(`${headerB64}.${payloadB64}`);
  const sig = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, input);
  // Convert DER signature to raw r||s (64 bytes)
  const sigBytes = new Uint8Array(sig);
  let rawSig: Uint8Array;
  if (sigBytes.length === 64) {
    rawSig = sigBytes;
  } else {
    // DER-encoded – parse
    const rLen = sigBytes[3];
    const r = sigBytes.slice(4, 4 + rLen);
    const sStart = 4 + rLen + 2;
    const s = sigBytes.slice(sStart);
    rawSig = new Uint8Array(64);
    rawSig.set(r.length > 32 ? r.slice(r.length - 32) : r, 32 - Math.min(r.length, 32));
    rawSig.set(s.length > 32 ? s.slice(s.length - 32) : s, 64 - Math.min(s.length, 32));
  }
  return `${headerB64}.${payloadB64}.${uint8ArrayToBase64url(rawSig)}`;
}

// Encrypt payload using RFC 8291 (aes128gcm)
async function encryptPayload(
  payload: string,
  p256dhKey: string,
  authSecret: string
): Promise<{ encrypted: Uint8Array; salt: Uint8Array; localPublicKey: Uint8Array }> {
  const enc = new TextEncoder();

  // Generate local ECDH key pair
  const localKeyPair = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const localPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", localKeyPair.publicKey));

  // Import subscriber's p256dh key
  const subPubBytes = base64urlToUint8Array(p256dhKey);
  const subscriberKey = await crypto.subtle.importKey("raw", subPubBytes, { name: "ECDH", namedCurve: "P-256" }, false, []);

  // Derive shared secret
  const sharedSecret = new Uint8Array(await crypto.subtle.deriveBits({ name: "ECDH", public: subscriberKey }, localKeyPair.privateKey, 256));

  // Auth secret
  const authBytes = base64urlToUint8Array(authSecret);

  // HKDF to derive IKM
  const authInfo = enc.encode("WebPush: info\0");
  const authInfoFull = new Uint8Array(authInfo.length + subPubBytes.length + localPubRaw.length);
  authInfoFull.set(authInfo);
  authInfoFull.set(subPubBytes, authInfo.length);
  authInfoFull.set(localPubRaw, authInfo.length + subPubBytes.length);

  const pseudoRandomKey = await hmacSha256(authBytes, sharedSecret);
  const ikm = await hmacSha256(pseudoRandomKey, concatBytes(authInfoFull, new Uint8Array([1])));

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Derive content encryption key and nonce
  const prk = await hmacSha256(salt, ikm);
  const cekInfo = enc.encode("Content-Encoding: aes128gcm\0");
  const contentKey = (await hmacSha256(prk, concatBytes(cekInfo, new Uint8Array([1])))).slice(0, 16);
  const nonceInfo = enc.encode("Content-Encoding: nonce\0");
  const nonce = (await hmacSha256(prk, concatBytes(nonceInfo, new Uint8Array([1])))).slice(0, 12);

  // Pad and encrypt
  const padded = concatBytes(new Uint8Array(enc.encode(payload)), new Uint8Array([2])); // delimiter
  const aesKey = await crypto.subtle.importKey("raw", contentKey, "AES-GCM", false, ["encrypt"]);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, padded));

  // Build aes128gcm body: salt(16) + rs(4) + idlen(1) + keyid(65) + ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096, false);
  const header = concatBytes(salt, rs, new Uint8Array([65]), localPubRaw);
  const encrypted = concatBytes(header, ciphertext);

  return { encrypted, salt, localPublicKey: localPubRaw };
}

async function hmacSha256(key: Uint8Array, data: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, data));
}

function concatBytes(...arrays: Uint8Array[]): Uint8Array {
  const totalLen = arrays.reduce((sum, a) => sum + a.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const a of arrays) { result.set(a, offset); offset += a.length; }
  return result;
}

async function sendPushNotification(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: object,
  vapidPrivateKey: CryptoKey
): Promise<boolean> {
  try {
    const payloadStr = JSON.stringify(payload);
    const { encrypted } = await encryptPayload(payloadStr, subscription.p256dh, subscription.auth);

    const url = new URL(subscription.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const jwt = await createVapidJwt(audience, vapidPrivateKey);

    const response = await fetch(subscription.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "aes128gcm",
        "TTL": "86400",
        "Authorization": `vapid t=${jwt}, k=${VAPID_PUBLIC_KEY}`,
      },
      body: encrypted,
    });

    if (response.status === 410 || response.status === 404) {
      console.log(`Subscription expired/invalid: ${subscription.endpoint.slice(0, 50)}`);
      return false; // subscription gone
    }

    if (!response.ok) {
      console.error(`Push failed: ${response.status} ${await response.text()}`);
    }

    return response.ok;
  } catch (err) {
    console.error("Push send error:", err);
    return false;
  }
}

// Fetch prayer times for a location with memoization
const prayerTimesCache = new Map<string, Record<string, string>>();

async function getPrayerTimes(lat: number, lon: number): Promise<Record<string, string> | null> {
  // Round to 2 decimal places (~1.1km precision) to increase cache hits
  const cacheKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
  if (prayerTimesCache.has(cacheKey)) {
    return prayerTimesCache.get(cacheKey)!;
  }

  try {
    const now = Math.floor(Date.now() / 1000);
    const res = await fetch(`https://api.aladhan.com/v1/timings/${now}?latitude=${lat}&longitude=${lon}&method=2`);
    const data = await res.json();
    if (data.code === 200) {
      prayerTimesCache.set(cacheKey, data.data.timings);
      return data.data.timings;
    }
  } catch (e) {
    console.error(`Failed to fetch prayer times for ${cacheKey}:`, e);
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const vapidPrivateKeyStr = Deno.env.get("VAPID_PRIVATE_KEY");
    if (!vapidPrivateKeyStr) throw new Error("VAPID_PRIVATE_KEY not configured");
    if (!VAPID_PUBLIC_KEY) throw new Error("VAPID_PUBLIC_KEY not configured");

    const vapidPrivateKey = await importVapidPrivateKey(vapidPrivateKeyStr);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Clear cache at start of each run to ensure fresh timings
    prayerTimesCache.clear();

    // Fetch all subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from("push_subscriptions")
      .select("*");

    if (subError) throw subError;
    if (!subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ sent: 0, checked: 0, message: "No subscriptions" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let sent = 0;
    let cleaned = 0;
    const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    // Process subscriptions
    for (const sub of subscriptions) {
      if (!sub.latitude || !sub.longitude) continue;

      const timings = await getPrayerTimes(sub.latitude, sub.longitude);
      if (!timings) continue;

      // Get current time in subscriber's timezone
      const now = new Date();
      let tzNow: Date;
      try {
        tzNow = new Date(now.toLocaleString("en-US", { timeZone: sub.timezone || "UTC" }));
      } catch (e) {
        console.error(`Invalid timezone for sub ${sub.id}: ${sub.timezone}. Falling back to UTC.`);
        tzNow = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
      }
      
      const currentMinutes = tzNow.getHours() * 60 + tzNow.getMinutes();

      for (const prayer of prayerNames) {
        const timeStr = timings[prayer]?.split(" ")[0];
        if (!timeStr) continue;
        const [h, m] = timeStr.split(":").map(Number);
        const prayerMinutes = h * 60 + m;

        // Send notification if within 1-minute window of prayer time
        if (Math.abs(currentMinutes - prayerMinutes) <= 1) {
          console.log(`Sending ${prayer} push to ${sub.endpoint.slice(0, 40)}...`);
          const success = await sendPushNotification(
            { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
            {
              title: `🕌 ${prayer} Prayer Time`,
              body: `It is time for ${prayer} prayer. May Allah accept your salah.`,
              tag: `prayer-${prayer}`,
              icon: "/pwa-icons/icon-192.svg",
            },
            vapidPrivateKey
          );

          if (success) {
            sent++;
          } else {
            // Clean up dead subscriptions
            console.log(`Cleaning up dead subscription: ${sub.id}`);
            await supabase.from("push_subscriptions").delete().eq("id", sub.id);
            cleaned++;
            break;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ sent, cleaned, checked: subscriptions.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const error = err as Error;
    console.error("Push scheduler error:", err);
    return new Response(
      JSON.stringify({ error: error.message || "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
