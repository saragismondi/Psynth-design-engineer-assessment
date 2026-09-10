import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Composer, type ComposerProps } from './Composer';

const DRAFT = 'Summarize the impression in two sentences';

function renderComposer(overrides: Partial<ComposerProps> = {}) {
  const props: ComposerProps = {
    value: DRAFT,
    onValueChange: vi.fn(),
    onSubmit: vi.fn(),
    onStop: vi.fn(),
    status: 'idle',
    ...overrides,
  };
  render(<Composer {...props} />);
  return props;
}

const field = () => screen.getByRole('textbox', { name: 'Ask about this report' });

describe('Composer', () => {
  it('submits the draft when Send is clicked', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderComposer();

    await user.click(screen.getByRole('button', { name: 'Send' }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('submits the draft when Enter is pressed', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderComposer();

    await user.type(field(), '{Enter}');

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('inserts a newline instead of submitting on Shift+Enter', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderComposer();

    await user.type(field(), '{Shift>}{Enter}{/Shift}');

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not submit an empty draft', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderComposer({ value: '   ' });

    await user.type(field(), '{Enter}');

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  describe('while streaming', () => {
    it('offers stop instead of send', () => {
      const { onStop } = renderComposer({ status: 'streaming' });

      expect(screen.getByRole('button', { name: 'Stop' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Send' })).not.toBeInTheDocument();
      expect(onStop).not.toHaveBeenCalled();
    });

    it('does not submit on Enter', async () => {
      const user = userEvent.setup();
      const { onSubmit } = renderComposer({ status: 'streaming' });

      await user.type(field(), '{Enter}');

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('stops the stream on Escape, as the hint advertises', async () => {
      const user = userEvent.setup();
      const { onStop } = renderComposer({ status: 'streaming' });

      await user.type(field(), '{Escape}');

      expect(onStop).toHaveBeenCalledTimes(1);
    });

    it('stops the stream when Stop is activated', async () => {
      const user = userEvent.setup();
      const { onStop, onSubmit } = renderComposer({ status: 'streaming' });

      await user.click(screen.getByRole('button', { name: 'Stop' }));

      expect(onStop).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
