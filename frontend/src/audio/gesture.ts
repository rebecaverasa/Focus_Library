/** Events that can carry user activation (HTML "activation triggering input event"). */
export const GESTURE_EVENTS = ['pointerdown', 'pointerup', 'keydown', 'touchend'] as const;

// Capture phase: runs before any stopPropagation in the app.
const CAPTURE = { capture: true };

interface ActivationSource {
  readonly isActive: boolean;
}

/**
 * Calls `onGesture` on the first event that really is a user activation, then stops
 * listening. Creating an AudioContext outside one is what triggers the autoplay warning, so
 * events that don't activate (a touch pointerdown, Escape) are skipped when the browser can
 * tell us (`navigator.userActivation`).
 */
export function onFirstGesture(
  target: EventTarget,
  onGesture: () => void,
  activation: ActivationSource | undefined = globalThis.navigator?.userActivation,
): () => void {
  const detach = () =>
    GESTURE_EVENTS.forEach((type) => target.removeEventListener(type, handler, CAPTURE));

  function handler() {
    if (activation && !activation.isActive) return;
    detach();
    onGesture();
  }

  GESTURE_EVENTS.forEach((type) => target.addEventListener(type, handler, CAPTURE));
  return detach;
}
