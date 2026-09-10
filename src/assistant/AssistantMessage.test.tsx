import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { errorMessage, sampleMessages } from '@/fixtures';
import { AssistantMessage } from './AssistantMessage';
import type { Message } from './types';

function renderInThread(message: Message, props: Record<string, unknown> = {}) {
  render(
    <ul aria-label="Conversation">
      <AssistantMessage message={message} {...props} />
    </ul>,
  );
}

/** Direct children only — citation chips are list items too, one level down. */
function turns() {
  const thread = screen.getByRole('list', { name: 'Conversation' });
  return Array.from(thread.children) as HTMLElement[];
}

describe('AssistantMessage', () => {
  describe('retry', () => {
    it('reports the failed turn id to the caller', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      renderInThread(errorMessage, { onRetry });

      await user.click(screen.getByRole('button', { name: 'Retry' }));

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(errorMessage.id);
    });

    it('offers no retry on a turn that did not fail', () => {
      renderInThread(sampleMessages[1], { onRetry: vi.fn() });

      expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    });
  });

  describe('role', () => {
    it('names the speaker in text on a user turn', () => {
      renderInThread(sampleMessages[0]);

      expect(turns()[0]).toHaveTextContent('You said');
    });

    it('names the speaker in text on an assistant turn', () => {
      renderInThread(sampleMessages[1]);

      expect(turns()[0]).toHaveTextContent('Assistant said');
    });

    it('keeps the two turns distinguishable without reading any styling', () => {
      render(
        <ul aria-label="Conversation">
          <AssistantMessage message={sampleMessages[0]} />
          <AssistantMessage message={sampleMessages[1]} />
        </ul>,
      );

      const [userTurn, assistantTurn] = turns();

      expect(userTurn).toHaveTextContent(`You said${sampleMessages[0].content}`);
      expect(assistantTurn).toHaveTextContent('Assistant said');
      expect(assistantTurn).not.toHaveTextContent('You said');
    });
  });
});
