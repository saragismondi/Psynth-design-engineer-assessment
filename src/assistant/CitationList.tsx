import { FileText, Hash, StickyNote } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Citation, CitationKind } from './types';

const kindIcon = {
  document: FileText,
  section: Hash,
  note: StickyNote,
} satisfies Record<CitationKind, typeof FileText>;

const kindLabel = {
  document: 'Document',
  section: 'Report section',
  note: 'Session note',
} satisfies Record<CitationKind, string>;

export type CitationListProps = {
  /** Sources backing the answer. */
  citations: Citation[];
  /** Called with the full citation so the caller can open it in the report. */
  onCitationClick?: (citation: Citation) => void;
  className?: string;
};

export function CitationList({ citations, onCitationClick, className }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <ul aria-label="Sources" className={cn('flex flex-wrap gap-1.5', className)}>
      {citations.map((citation) => {
        const Icon = kindIcon[citation.kind];
        return (
          <li key={citation.id} className="min-w-0 max-w-full">
            <button
              type="button"
              onClick={() => onCitationClick?.(citation)}
              className={cn(
                'flex min-w-0 max-w-full items-center gap-1.5 rounded-full',
                'border border-border-subtle bg-bg-subtle px-2 py-1',
                'text-xs text-text-primary hover:bg-bg-muted',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
              )}
            >
              <Icon aria-hidden="true" className="size-3 shrink-0" />
              <span className="sr-only">{kindLabel[citation.kind]}:</span>
              <span className="truncate">{citation.title}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
