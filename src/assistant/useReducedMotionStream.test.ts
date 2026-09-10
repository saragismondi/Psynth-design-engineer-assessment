import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useReducedMotionStream } from './useReducedMotionStream';

const TEXT = 'Digit span is weaker than the rest of the battery.';

function stubReducedMotion(matches: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((media: string) => ({
      matches,
      media,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('useReducedMotionStream', () => {
  it('types the answer out when motion is welcome', async () => {
    stubReducedMotion(false);
    vi.useFakeTimers();
    const { result } = renderHook(() => useReducedMotionStream({ text: TEXT, intervalMs: 10 }));

    act(() => result.current.start());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30);
    });

    expect(result.current.status).toBe('streaming');
    expect(result.current.content.length).toBeGreaterThan(0);
    expect(result.current.content.length).toBeLessThan(TEXT.length);
  });

  it('delivers the answer whole when the reader asked for less motion', () => {
    stubReducedMotion(true);
    const { result } = renderHook(() => useReducedMotionStream({ text: TEXT, intervalMs: 10 }));

    expect(result.current.content).toBe('');

    act(() => result.current.start());

    expect(result.current.content).toBe(TEXT);
    expect(result.current.status).toBe('done');
  });
});
