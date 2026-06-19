import { MMKV } from "react-native-mmkv";

// MMKV has a built-in web shim (createMMKV.web.js → localStorage).
// Metro resolves the correct platform variant automatically.
const mmkvInstance = new MMKV({ id: "myislam-storage" });

export const mmkv = mmkvInstance;

// ─── In-memory sessionStorage ─────────────────────────────────────────────────
const sessionData: Record<string, string> = {};

// ─── Global polyfills ─────────────────────────────────────────────────────────
if (typeof global !== "undefined") {
  // localStorage → MMKV (native) / localStorage shim (web)
  (global as any).localStorage = {
    getItem: (key: string): string | null => mmkvInstance.getString(key) ?? null,
    setItem: (key: string, value: string): void => mmkvInstance.set(key, value),
    removeItem: (key: string): void => mmkvInstance.delete(key),
    clear: (): void => mmkvInstance.clearAll(),
    get length() { return mmkvInstance.getAllKeys().length; },
    key: (_index: number): string | null => null,
  };

  (global as any).sessionStorage = {
    getItem: (key: string): string | null => sessionData[key] ?? null,
    setItem: (key: string, value: string): void => { sessionData[key] = value; },
    removeItem: (key: string): void => { delete sessionData[key]; },
    clear: (): void => { Object.keys(sessionData).forEach((k) => delete sessionData[k]); },
    get length() { return Object.keys(sessionData).length; },
    key: (_index: number): string | null => null,
  };

  if (typeof (global as any).window === "undefined") {
    (global as any).window = global;
  }

  if (typeof (global as any).window.addEventListener !== "function") {
    const _listeners: Record<string, Set<Function>> = {};
    (global as any).window.addEventListener = (event: string, handler: Function) => {
      if (!_listeners[event]) _listeners[event] = new Set();
      _listeners[event].add(handler);
    };
    (global as any).window.removeEventListener = (event: string, handler: Function) => {
      _listeners[event]?.delete(handler);
    };
    (global as any).window.dispatchEvent = (_e: any) => true;
  }

  if (typeof (global as any).document === "undefined") {
    (global as any).document = {
      addEventListener: () => {},
      removeEventListener: () => {},
      visibilityState: "visible",
    };
  }

  if (typeof (global as any).navigator === "undefined") {
    (global as any).navigator = {};
  }
  if (typeof (global as any).navigator.onLine === "undefined") {
    (global as any).navigator.onLine = true;
  }
  if (typeof (global as any).navigator.geolocation === "undefined") {
    (global as any).navigator.geolocation = null;
  }
}
