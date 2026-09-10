import { RotateCcw, TriangleAlert } from 'lucide-react';
import { Button, Text } from '@/primitives';
import { cn } from '@/lib/cn';
import { CitationList } from './CitationList';
import type { Citation, Message } from './types';

export type AssistantMessageProps = {
  /** The turn to render. Renders as an `<li>`, so keep it inside the thread list. */
  message: Message;
  /** Called with the failed turn's id. Retry only renders when `status` is `error`. */
  onRetry?: (messageId: string) => void;
  /** Called when a source chip is activated. */
  onCitationClick?: (citation: Citation) => void;
  className?: string;
};

export function AssistantMessage({
  message,
  onRetry,
  onCitationClick,
  className,
}: AssistantMessageProps) {
  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';

  return (
    <li
      className={cn('flex flex-col gap-2', isUser ? 'items-end' : 'items-start', className)}
      aria-busy={isStreaming || undefined}
    >
      <span className="sr-only">{isUser ? 'You said' : 'Assistant said'}</span>

      {isUser ? (
        <Text className="max-w-[85%] whitespace-pre-wrap break-words rounded-[var(--radius-md)] bg-sage-surface px-3 py-2">
          {message.content}
        </Text>
      ) : (
        <div className="w-full">
          {isError ? (
            <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-danger/40 bg-danger-surface px-3 py-2">
              <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-danger" />
              <Text className="min-w-0 break-words">{message.content}</Text>
            </div>
          ) : (
            <Text className="whitespace-pre-wrap break-words">
              {message.content}
              {isStreaming && (
                <span
                  aria-hidden="true"
                  className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-text-secondary"
                />
              )}
            </Text>
          )}
        </div>
      )}

      {message.citations && message.citations.length > 0 && (
        <CitationList citations={message.citations} onCitationClick={onCitationClick} />
      )}

      {isError && onRetry && (
        <Button variant="secondary" size="sm" onClick={() => onRetry(message.id)}>
          <RotateCcw aria-hidden="true" className="size-3" />
          Retry
        </Button>
      )}
    </li>
  );
}
