let adhanAudio: HTMLAudioElement | null = null;

export function playAdhan(url: string) {
  try {
    // Stop previous adhan if playing
    if (adhanAudio) {
      try { adhanAudio.pause(); } catch {}
      try { adhanAudio.src = ""; } catch {}
      adhanAudio = null;
    }

    adhanAudio = new Audio(url);
    adhanAudio.preload = "auto";
    adhanAudio.play().catch((e) => {
      console.error("Adhan playback blocked:", e);
    });
  } catch (e) {
    console.error("Failed to play adhan:", e);
  }
}

export function stopAdhan() {
  if (adhanAudio) {
    try { adhanAudio.pause(); } catch {}
    try { adhanAudio.src = ""; } catch {}
    adhanAudio = null;
  }
}

export default { playAdhan, stopAdhan };
