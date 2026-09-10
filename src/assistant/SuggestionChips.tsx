import { Button } from '@/primitives';
import { cn } from '@/lib/cn';

export type SuggestionChipsProps = {
  /** Prompts offered in the empty state. */
  suggestions: readonly string[];
  /** Called with the chosen prompt. Selecting a chip is a submit path, not just a fill. */
  onSuggestionSelect: (prompt: string) => void;
  /** Accessible name for the list, announced before the chips. */
  label?: string;
  className?: string;
};

export function SuggestionChips({
  suggestions,
  onSuggestionSelect,
  label = 'Suggested prompts',
  className,
}: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <ul aria-label={label} className={cn('flex flex-wrap justify-center gap-2', className)}>
      {suggestions.map((prompt) => (
        <li key={prompt}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSuggestionSelect(prompt)}
            className={cn(
              'h-auto whitespace-normal rounded-full py-1.5 text-left',
              'bg-bg-subtle hover:bg-bg-muted',
            )}
          >
            {prompt}
          </Button>
        </li>
      ))}
    </ul>
  );
}
