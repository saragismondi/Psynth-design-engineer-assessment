import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import {
  clinician,
  denseThread,
  errorMessage,
  sampleMessages,
  sampleSuggestions,
} from '@/fixtures';
import { AssistantPanel, type AssistantPanelProps } from './AssistantPanel';
import { useReducedMotionStream } from './useReducedMotionStream';
import type { Message } from './types';

const STREAMED_ANSWER =
  'Working memory and CPT omission scores are the main supports. Digit span is weaker than the rest of the battery, which is consistent with the attention finding.';

/** Keeps thread and draft in the story, so the panel itself stays fully controlled. */
function PanelDemo({ messages: seed, status: seedStatus, ...args }: AssistantPanelProps) {
  const [messages, setMessages] = useState(seed);
  const [status, setStatus] = useState(seedStatus);
  const [value, setValue] = useState('');

  useEffect(() => setMessages(seed), [seed]);
  useEffect(() => setStatus(seedStatus), [seedStatus]);

  function send(prompt: string) {
    if (prompt.trim().length === 0) return;
    setMessages((prev) => [
      ...prev,
      { id: `local-${prev.length}`, role: 'user', content: prompt, status: 'done' },
    ]);
    setValue('');
  }

  return (
    <AssistantPanel
      {...args}
      messages={messages}
      status={status}
      value={value}
      onValueChange={setValue}
      onSubmit={() => {
        args.onSubmit?.();
        send(value);
      }}
      onStop={() => {
        args.onStop?.();
        setStatus('idle');
      }}
      onSuggestionSelect={(prompt) => {
        args.onSuggestionSelect?.(prompt);
        send(prompt);
      }}
      onRetry={(messageId) => {
        args.onRetry?.(messageId);
        setMessages((prev) => prev.filter((message) => message.id !== messageId));
        setStatus('idle');
      }}
    />
  );
}

/** Drives a real growing answer so the streaming affordances can be seen, not imagined. */
function StreamingDemo({ messages: _seed, status: _status, ...args }: AssistantPanelProps) {
  const { content, status: streamStatus, start, stop } = useReducedMotionStream({
    text: STREAMED_ANSWER,
    intervalMs: 30,
  });
  const [settled, setSettled] = useState<Message[]>([sampleMessages[0]]);
  const [value, setValue] = useState('');

  useEffect(() => {
    start();
  }, [start]);

  const isStreaming = streamStatus === 'streaming';

  const messages: Message[] = [
    ...settled,
    {
      id: `msg-streaming-${settled.length}`,
      role: 'assistant',
      content,
      status: isStreaming ? 'streaming' : 'done',
    },
  ];

  function send(prompt: string) {
    if (prompt.trim().length === 0) return;
    setSettled((prev) => [
      ...prev,
      { id: `answer-${prev.length}`, role: 'assistant', content, status: 'done' },
      { id: `ask-${prev.length}`, role: 'user', content: prompt, status: 'done' },
    ]);
    setValue('');
    start();
  }

  return (
    <AssistantPanel
      {...args}
      messages={messages}
      status={isStreaming ? 'streaming' : 'idle'}
      value={value}
      onValueChange={setValue}
      onSubmit={() => {
        args.onSubmit?.();
        send(value);
      }}
      onSuggestionSelect={(prompt) => {
        args.onSuggestionSelect?.(prompt);
        send(prompt);
      }}
      onStop={() => {
        args.onStop?.();
        stop();
      }}
    />
  );
}

/** The frame width belongs to the decorator, not to the panel, so it lives beside the props. */
type PanelStoryArgs = AssistantPanelProps & { width: number };

const meta = {
  title: 'Assistant/Panel',
  component: AssistantPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Assistant docked beside a clinical report: header, scrollable thread, composer.',
          '',
          'The panel is **controlled** — it owns no state. Thread, status and draft come in as',
          'props, and every interaction leaves as a callback. Stories keep that state with',
          '`useState`.',
          '',
          'It renders at `h-full w-full` and takes its size from the container. Production docks',
          'it at about 420px by viewport height; these stories frame it there, but nothing in the',
          'component assumes that width — drag the `width` control from 360px to 560px and the',
          'panel follows it. That frame is a story decorator: the number lives here, not in the',
          'component, and the real consumer is a report editor that decides the width itself.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story, { args }) => (
      <div className="flex justify-center px-2 py-4">
        <div
          style={{ width: args.width }}
          className="h-[600px] max-w-full overflow-hidden rounded-[var(--radius-lg)] border border-border-subtle shadow-[0_6px_20px_-6px_rgb(15_23_42_/_0.10)] outline outline-2 outline-dashed outline-border-default outline-offset-[8px]"
        >
          <Story />
        </div>
      </div>
    ),
  ],
  argTypes: {
    width: {
      control: { type: 'range', min: 360, max: 560, step: 20 },
      description:
        'Width of the story frame, not a panel prop. The panel takes its size from whatever holds it, so this is here to prove that rather than to configure it.',
      table: { category: 'Story frame' },
    },
    status: {
      control: 'select',
      options: ['idle', 'streaming', 'error'],
      description: 'Panel state. Switch to `streaming` to see send become stop.',
    },
    messages: { control: false },
    suggestions: { control: 'object' },
    greeting: { control: 'text' },
    description: { control: 'text' },
    title: { control: 'text' },
  },
  args: {
    width: 420,
    title: 'Assistant',
    status: 'idle',
    value: '',
    messages: [],
    suggestions: sampleSuggestions,
    onValueChange: fn(),
    onSubmit: fn(),
    onStop: fn(),
    onRetry: fn(),
    onSuggestionSelect: fn(),
    onCitationClick: fn(),
    onClose: fn(),
  },
  render: ({ width: _width, ...args }) => <PanelDemo {...args} />,
} satisfies Meta<PanelStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    messages: [],
    greeting: `Good morning, ${clinician.firstName}`,
    description: 'Ask about the case, request a rewrite, or inspect a source.',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this as the first-run state. There is no history to read, so the panel spends its space on orientation: what this is, and three prompts that are cheaper to click than to type. Choosing a chip submits — it does not just fill the field — and focus lands back in the composer so the next question can be typed straight away.',
      },
    },
  },
};

export const Streaming: Story = {
  render: ({ width: _width, ...args }) => <StreamingDemo {...args} />,
  args: { status: 'streaming' },
  parameters: {
    docs: {
      description: {
        story:
          'Use this while an answer is arriving. Send is replaced by stop, and Enter no longer submits, so a second turn cannot be queued on top of the first. The caret marks the live edge of the text. Screen readers hear a single "Assistant is responding" rather than the answer letter by letter, and a reader who asked for reduced motion gets the whole answer at once instead of a typing effect.',
      },
    },
  },
};

export const Error: Story = {
  args: {
    status: 'error',
    messages: [sampleMessages[0], errorMessage],
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this when a turn fails. The failure is stated in words next to a warning icon, never by colour alone, and it sits in the thread where the answer would have been. Retry is the only action offered and it carries the failed turn id, so the caller knows which turn to run again. The composer stays usable — a failed turn should not trap the clinician.',
      },
    },
  },
};

export const WithCitations: Story = {
  args: {
    messages: sampleMessages,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this when the answer leans on sources. Each chip names its source and carries its kind — document, report section, session note — as text for screen readers, not just as an icon. Long titles truncate instead of pushing the panel wide. Activating a chip reports the whole citation back, so the caller can open it in the report without the panel knowing how.',
      },
    },
  },
};

export const DenseThread: Story = {
  args: {
    messages: denseThread,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use this to check the panel under a long conversation. Only the thread scrolls: the header and the composer stay put, so the way out and the way to ask again are always on screen. New text follows the bottom only while you are already there — scroll up to re-read an earlier turn and an incoming chunk will not yank you back down.',
      },
    },
  },
};
