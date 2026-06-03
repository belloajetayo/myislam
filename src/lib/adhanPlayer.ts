export const DEFAULT_ADHAN_URL = "https://www.islamcan.com/audio/adhan/azan2.mp3";

let adhanAudio: HTMLAudioElement | null = null;

function getAdhanAudio(url: string) {
  const absoluteUrl = new URL(url, window.location.href).href;
  if (!adhanAudio) {
    adhanAudio = new Audio(absoluteUrl);
    adhanAudio.preload = "auto";
    adhanAudio.volume = 0.9;
  } else if (adhanAudio.src !== absoluteUrl) {
    adhanAudio.pause();
    adhanAudio.src = absoluteUrl;
    adhanAudio.load();
  }

  return adhanAudio;
}

export async function primeAdhan(url: string = DEFAULT_ADHAN_URL): Promise<boolean> {
  try {
    const audio = getAdhanAudio(url);
    audio.pause();
    audio.currentTime = 0;
    audio.muted = true;

    await audio.play();
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 0.9;
    return true;
  } catch (e) {
    if (adhanAudio) {
      adhanAudio.muted = false;
      adhanAudio.volume = 0.9;
    }
    console.warn("Adhan priming failed:", e);
    return false;
  }
}

export async function playAdhan(url: string = DEFAULT_ADHAN_URL): Promise<boolean> {
  try {
    const audio = getAdhanAudio(url);
    audio.pause();
    audio.currentTime = 0;
    audio.muted = false;
    audio.volume = 0.9;

    const loadError = new Promise<never>((_, reject) => {
      audio.addEventListener(
        "error",
        () => reject(new Error(`Unable to load adhan audio: ${url}`)),
        { once: true },
      );
    });

    await Promise.race([audio.play(), loadError]);
    return true;
  } catch (e) {
    stopAdhan();
    console.error("Adhan playback failed:", e);
    return false;
  }
}

export function stopAdhan() {
  if (adhanAudio) {
    adhanAudio.pause();
    adhanAudio.currentTime = 0;
  }
}

export default { playAdhan, primeAdhan, stopAdhan };
