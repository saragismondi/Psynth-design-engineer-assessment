/** Where a cited source lives, which drives its icon and label in the UI. */
export type CitationKind = 'document' | 'section' | 'note';

export type Citation = {
  /** Stable identifier passed back to `onCitationClick`. */
  id: string;
  /** Human-readable source name shown on the chip. */
  title: string;
  /** Source category: an uploaded file, a section of this report, or a session note. */
  kind: CitationKind;
};

export type Message = {
  /** Stable identifier; `onRetry` receives this for a failed turn. */
  id: string;
  /** Who produced the turn. Exposed to assistive tech, never signalled by colour alone. */
  role: 'user' | 'assistant';
  /** Turn text. While streaming this is the partial text received so far. */
  content: string;
  /** Sources backing an assistant answer. Omit when the turn cites nothing. */
  citations?: Citation[];
  /** Per-turn state. Defaults to `done`; `streaming` shows a caret, `error` shows retry. */
  status?: 'done' | 'streaming' | 'error';
};

/** Panel-wide state. Drives composer affordances: `streaming` swaps send for stop. */
export type AssistantStatus = 'idle' | 'streaming' | 'error';
