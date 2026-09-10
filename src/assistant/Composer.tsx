import {
  useLayoutEffect,
  useRef,
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from 'react';
import { Send, Square } from 'lucide-react';
import { Button, Text, Textarea } from '@/primitives';
import { cn } from '@/lib/cn';
import type { AssistantStatus } from './types';

const MAX_HEIGHT = 160;

export type ComposerProps = {
  /** Current draft text. The composer is controlled — it holds no state of its own. */
  value: string;
  /** Called on every keystroke with the next draft value. */
  onValueChange: (value: string) => void;
  /** Called when the clinician sends the draft, by click or by Enter. */
  onSubmit: () => void;
  /** Called when the clinician interrupts a streaming answer. */
  onStop: () => void;
  /** Panel state. While `streaming`, send is replaced by stop and Enter does not submit. */
  status: AssistantStatus;
  /** Placeholder shown while the field is empty. */
  placeholder?: string;
  /** Accessible name for the field, since there is no visible label. */
  label?: string;
  /** Lets the panel return focus here after a chip or a retry. */
  inputRef?: RefObject<HTMLTextAreaElement | null>;
  className?: string;
};

export function Composer({
  value,
  onValueChange,
  onSubmit,
  onStop,
  status,
  placeholder = 'Ask about this report…',
  label = 'Ask about this report',
  inputRef,
  className,
}: ComposerProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const textareaRef = inputRef ?? internalRef;

  const isStreaming = status === 'streaming';
  const canSubmit = !isStreaming && value.trim().length > 0;

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
  }, [value]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    onSubmit();
    textareaRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape' && isStreaming) {
      event.preventDefault();
      onStop();
      return;
    }
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    formRef.current?.requestSubmit();
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={cn(
        'rounded-[var(--radius-md)] border border-border-subtle bg-bg-surface p-2',
        'outline outline-2 outline-dashed outline-border-default',
        'focus-within:ring-2 focus-within:ring-focus',
        className,
      )}
    >
      <Textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={label}
        className="min-h-8 resize-none overflow-y-auto border-0 bg-transparent px-2 py-1.5 focus-visible:ring-0"
      />
      <div className="mt-1 flex items-center justify-between gap-2 px-1">
        <Text as="span" tone="tertiary" className="text-xs">
          {isStreaming ? 'Esc to stop' : 'Enter to send'}
        </Text>
        {isStreaming ? (
          <Button type="button" size="sm" variant="secondary" onClick={onStop}>
            <Square aria-hidden="true" className="size-3" />
            Stop
          </Button>
        ) : (
          <Button type="submit" size="sm" disabled={!canSubmit}>
            <Send aria-hidden="true" className="size-3" />
            Send
          </Button>
        )}
      </div>
    </form>
  );
}
