import { describe, expect, it, vi } from 'vitest';
import { onFirstGesture } from './gesture';

describe('onFirstGesture', () => {
  it('fires once on the first gesture and then detaches', () => {
    const target = new EventTarget();
    const onGesture = vi.fn();
    onFirstGesture(target, onGesture, undefined);

    target.dispatchEvent(new Event('keydown'));
    target.dispatchEvent(new Event('pointerdown'));
    expect(onGesture).toHaveBeenCalledTimes(1);
  });

  it('ignores events that carry no user activation', () => {
    const target = new EventTarget();
    const onGesture = vi.fn();
    const activation = { isActive: false };
    onFirstGesture(target, onGesture, activation);

    target.dispatchEvent(new Event('pointerdown'));
    expect(onGesture).not.toHaveBeenCalled();

    activation.isActive = true;
    target.dispatchEvent(new Event('pointerup'));
    expect(onGesture).toHaveBeenCalledTimes(1);
  });

  it('can be cancelled before any gesture', () => {
    const target = new EventTarget();
    const onGesture = vi.fn();
    const detach = onFirstGesture(target, onGesture, undefined);
    detach();
    target.dispatchEvent(new Event('keydown'));
    expect(onGesture).not.toHaveBeenCalled();
  });
});
