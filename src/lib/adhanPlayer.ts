import { Audio } from "expo-av";

export const DEFAULT_ADHAN_URL =
  "https://www.islamcan.com/audio/adhan/azan2.mp3";

let currentSound: Audio.Sound | null = null;

async function loadSound(url: string): Promise<Audio.Sound> {
  if (currentSound) {
    await currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
  });

  const { sound } = await Audio.Sound.createAsync(
    { uri: url },
    { shouldPlay: false, volume: 0.9 }
  );
  currentSound = sound;
  return sound;
}

export async function primeAdhan(url: string = DEFAULT_ADHAN_URL): Promise<boolean> {
  try {
    await loadSound(url);
    return true;
  } catch (e) {
    console.warn("Adhan priming failed:", e);
    return false;
  }
}

export async function playAdhan(url: string = DEFAULT_ADHAN_URL): Promise<boolean> {
  try {
    const sound = await loadSound(url);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        currentSound = null;
      }
    });
    return true;
  } catch (e) {
    console.error("Adhan playback failed:", e);
    return false;
  }
}

export function stopAdhan(): void {
  if (currentSound) {
    currentSound.stopAsync().catch(() => {});
    currentSound.unloadAsync().catch(() => {});
    currentSound = null;
  }
}

export default { playAdhan, primeAdhan, stopAdhan };
