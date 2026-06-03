export const DEFAULT_ADHAN_URL = "https://www.islamcan.com/audio/adhan/azan2.mp3";

let adhanAudio: HTMLAudioElement | null = null;

export async function playAdhan(url: string = DEFAULT_ADHAN_URL): Promise<boolean> {
  try {
    stopAdhan();

    const audio = new Audio(url);
    adhanAudio = audio;
    audio.preload = "auto";
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
    adhanAudio.removeAttribute("src");
    adhanAudio.load();
    adhanAudio = null;
  }
}

export default { playAdhan, stopAdhan };
