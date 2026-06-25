/**
 * adhanPlayer.ts — Web Audio implementation
 *
 * Uses the standard HTMLAudioElement so it works in all browsers.
 * The expo-av import was removed because it is React Native only and
 * silently fails (returns false) on the web, causing the "text-only"
 * notification symptom.
 */

export const DEFAULT_ADHAN_URL =
  "https://www.islamcan.com/audio/adhan/azan2.mp3";

let currentAudio: HTMLAudioElement | null = null;

export async function primeAdhan(url: string = DEFAULT_ADHAN_URL): Promise<boolean> {
  try {
    // Pre-load the audio file so playback is instant when called.
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.volume = 0;
    // A zero-volume play+immediate pause "warms up" the audio context on iOS.
    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 0.9;
    currentAudio = audio;
    return true;
  } catch (e) {
    console.warn("Adhan priming failed:", e);
    return false;
  }
}

export async function playAdhan(url: string = DEFAULT_ADHAN_URL): Promise<boolean> {
  try {
    // Reuse primed audio if URL matches, otherwise create fresh.
    if (!currentAudio || currentAudio.src !== url) {
      currentAudio = new Audio(url);
      currentAudio.preload = "auto";
    }
    currentAudio.volume = 0.9;
    currentAudio.currentTime = 0;

    await currentAudio.play();

    currentAudio.onended = () => {
      currentAudio = null;
    };

    return true;
  } catch (e) {
    // NotAllowedError means autoplay was blocked — caller should retry on
    // user gesture. Any other error is a real failure.
    const err = e as DOMException;
    if (err?.name === "NotAllowedError") {
      console.warn("Adhan blocked by autoplay policy — will retry on user interaction.");
    } else {
      console.error("Adhan playback failed:", e);
    }
    return false;
  }
}

export function stopAdhan(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export default { playAdhan, primeAdhan, stopAdhan };
