import { useEffect, useRef } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Heading, IconButton, Text } from '@/primitives';
import { cn } from '@/lib/cn';
import { AssistantMessage } from './AssistantMessage';
import { Composer } from './Composer';
import { SuggestionChips } from './SuggestionChips';
import type { AssistantStatus, Citation, Message } from './types';

const PINNED_THRESHOLD_PX = 48;

export type AssistantPanelProps = {
  /** Thread so far, oldest first. */
  messages: Message[];
  /** Panel state. Drives the composer and the status announcement. */
  status: AssistantStatus;
  /** Composer draft text. */
  value: string;
  /** Called with the next draft value. */
  onValueChange: (value: string) => void;
  /** Called when the clinician sends the draft. */
  onSubmit: () => void;
  /** Called when the clinician interrupts a streaming answer. */
  onStop: () => void;
  /** Called with the failed turn's id. */
  onRetry?: (messageId: string) => void;
  /** Called with the chosen empty-state prompt. */
  onSuggestionSelect?: (prompt: string) => void;
  /** Called when a source chip is activated. */
  onCitationClick?: (citation: Citation) => void;
  /** Called from the header's close action. Hidden when omitted. */
  onClose?: () => void;
  /** Prompts shown in the empty state. */
  suggestions?: readonly string[];
  /** Panel title, also its accessible name. */
  title?: string;
  /** Empty-state headline. */
  greeting?: string;
  /** Empty-state supporting line. */
  description?: string;
  className?: string;
};

export function AssistantPanel({
  messages,
  status,
  value,
  onValueChange,
  onSubmit,
  onStop,
  onRetry,
  onSuggestionSelect,
  onCitationClick,
  onClose,
  suggestions = [],
  title = 'Assistant',
  greeting = 'How can I help?',
  description = 'Ask about the case, request a rewrite, or inspect a source.',
  className,
}: AssistantPanelProps) {
  const threadRef = useRef<HTMLDivElement>(null);
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const pinnedToBottom = useRef(true);

  useEffect(() => {
    const el = threadRef.current;
    if (!el || !pinnedToBottom.current) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  function handleScroll() {
    const el = threadRef.current;
    if (!el) return;
    pinnedToBottom.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < PINNED_THRESHOLD_PX;
  }

  function handleSuggestionSelect(prompt: string) {
    onSuggestionSelect?.(prompt);
    composerRef.current?.focus();
  }

  function handleRetry(messageId: string) {
    onRetry?.(messageId);
    composerRef.current?.focus();
  }

  const announcement =
    status === 'streaming'
      ? 'Assistant is responding'
      : status === 'error'
        ? 'Response failed'
        : messages.length > 0
          ? 'Response complete'
          : '';

  const isEmpty = messages.length === 0;

  return (
    <aside
      aria-label={title}
      className={cn(
        'grid h-full w-full grid-rows-[auto_1fr_auto] overflow-hidden',
        'bg-[radial-gradient(145%_100%_at_18%_100%,color-mix(in_oklab,var(--color-surface-wash)_100%,var(--color-bg-surface))_0%,color-mix(in_oklab,var(--color-surface-wash)_20%,var(--color-bg-surface))_55%,var(--color-bg-surface)_100%)]',
        className,
      )}
    >
      <header className="flex items-center gap-2 border-b border-border-subtle px-4 py-3">
        <Sparkles aria-hidden="true" className="size-4 shrink-0 text-text-secondary" />
        <Heading as="h2" className="min-w-0 flex-1 truncate text-sm">
          {title}
        </Heading>
        {onClose && (
          <IconButton aria-label="Close assistant" onClick={onClose}>
            <X aria-hidden="true" className="size-4" />
          </IconButton>
        )}
      </header>

      <div
        ref={threadRef}
        onScroll={handleScroll}
        tabIndex={0}
        role="region"
        aria-label="Conversation"
        className={cn(
          'min-h-0 overflow-y-auto px-4 py-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus',
        )}
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-bg-muted">
              <Sparkles aria-hidden="true" className="size-6 text-text-primary" />
            </span>
            <div className="flex flex-col gap-1">
              <Heading as="h3" className="text-base normal-case tracking-normal text-text-primary">
                {greeting}
              </Heading>
              <Text tone="secondary">{description}</Text>
            </div>
            <SuggestionChips
              suggestions={suggestions}
              onSuggestionSelect={handleSuggestionSelect}
              className="mt-1"
            />
          </div>
        ) : (
          <ul className="flex flex-col gap-5">
            {messages.map((message) => (
              <AssistantMessage
                key={message.id}
                message={message}
                onRetry={onRetry ? handleRetry : undefined}
                onCitationClick={onCitationClick}
              />
            ))}
          </ul>
        )}
      </div>

      <div className="p-3">
        <Composer
          value={value}
          onValueChange={onValueChange}
          onSubmit={onSubmit}
          onStop={onStop}
          status={status}
          inputRef={composerRef}
        />
      </div>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </aside>
  );
}
