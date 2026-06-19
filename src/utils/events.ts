type Listener<T = unknown> = (data: T) => void;

class AppEventEmitter {
  private listeners: Map<string, Set<Listener<any>>> = new Map();

  on<T>(event: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
    return () => this.off(event, listener);
  }

  off<T>(event: string, listener: Listener<T>): void {
    this.listeners.get(event)?.delete(listener);
  }

  emit<T>(event: string, data: T): void {
    this.listeners.get(event)?.forEach((listener) => listener(data));
  }
}

export const appEvents = new AppEventEmitter();
