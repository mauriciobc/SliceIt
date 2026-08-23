import { describe, it, expect, vi, afterEach } from 'vitest';
import { dismissToast, showToast, subscribeToast } from '@/lib/toast';

describe('toast channel', () => {
  afterEach(() => {
    dismissToast();
    vi.restoreAllMocks();
  });

  it('notifies subscribers of new messages', () => {
    const listener = vi.fn();
    subscribeToast(listener);
    showToast('export.downloaded');
    expect(listener).toHaveBeenLastCalledWith('export.downloaded');
  });

  it('dismisses by notifying with null', () => {
    const listener = vi.fn();
    subscribeToast(listener);
    showToast('export.downloaded');
    dismissToast();
    expect(listener).toHaveBeenLastCalledWith(null);
  });

  it('unsubscribing stops notifications', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToast(listener);
    unsubscribe();
    showToast('export.downloaded');
    // Only the initial sync delivery happened; the new message did not arrive.
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(null);
  });

  it('delivers the current message to late subscribers', () => {
    showToast('focus.enter');
    const listener = vi.fn();
    subscribeToast(listener);
    expect(listener).toHaveBeenCalledWith('focus.enter');
  });
});