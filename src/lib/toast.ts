/**
 * Minimal dependency-free toast channel. The project deliberately has no toast
 * library; this tiny emitter + the <Toast/> component cover transient
 * confirmation messages (e.g. "export done").
 */
type ToastListener = (messageKey: string | null) => void;

let current: string | null = null;
const listeners = new Set<ToastListener>();

export function showToast(messageKey: string): void {
  current = messageKey;
  listeners.forEach((listener) => listener(messageKey));
}

export function dismissToast(): void {
  current = null;
  listeners.forEach((listener) => listener(null));
}

export function subscribeToast(listener: ToastListener): () => void {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}
