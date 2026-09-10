import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { errorMessage, sampleCitations, sampleMessages } from '@/fixtures';
import { AssistantMessage } from './AssistantMessage';

const meta = {
  title: 'Assistant/Message',
  component: AssistantMessage,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'One turn in the thread. It renders an `li`, so it belongs inside the thread\'s list — the',
          'stories supply that wrapper.',
          '',
          'The two roles are told apart three ways, and colour is only the third: each turn opens',
          'with a screen-reader-only "You said" / "Assistant said", the user sits right and the',
          'assistant left, and only the user carries a fill. The assistant\'s own turns deliberately',
          'have none — they are the long text, and a tint would only make them harder to read.',
          '',
          'Use the `message` control to switch role, status and content on any of these.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <ul className="flex w-[380px] flex-col gap-5">
        <Story />
      </ul>
    ),
  ],
  argTypes: {
    message: { control: 'object' },
  },
  args: {
    onRetry: fn(),
    onCitationClick: fn(),
    message: sampleMessages[0],
  },
} satisfies Meta<typeof AssistantMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UserTurn: Story = {
  args: { message: sampleMessages[0] },
  parameters: {
    docs: {
      description: {
        story:
          'What the clinician asked. It sits right, in a `sage-surface` bubble capped at 85% of the width so a turn always reads as a bubble rather than as a full-width block. Long words break instead of widening the panel.',
      },
    },
  },
};

export const AssistantTurn: Story = {
  args: { message: { ...sampleMessages[1], citations: undefined } },
  parameters: {
    docs: {
      description: {
        story:
          'The answer, as plain full-width text. This is the turn the clinician actually reads, so it gets the full measure and no fill competing with it.',
      },
    },
  },
};

export const Streaming: Story = {
  args: {
    message: {
      id: 'msg-streaming',
      role: 'assistant',
      content: 'Working memory and CPT omission scores are the main',
      status: 'streaming',
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          'An answer still arriving. A caret marks the live edge of the text, and the turn carries `aria-busy` so assistive tech knows it is unfinished. The caret is decorative and hidden from screen readers — the panel announces the state once, rather than letting a live region read the answer letter by letter. A reader who asked for reduced motion gets the answer whole instead.',
      },
    },
  },
};

export const WithCitations: Story = {
  args: { message: { ...sampleMessages[1], citations: sampleCitations } },
  parameters: {
    docs: {
      description: {
        story:
          'An answer that leans on sources. Each chip names its source and carries its kind — document, report section, session note — as text, not only as an icon. Activating one reports the whole citation back, so the caller can open it in the report without this component knowing how.',
      },
    },
  },
};

export const Failed: Story = {
  args: { message: errorMessage },
  parameters: {
    docs: {
      description: {
        story:
          'A turn that failed. The failure is stated in words beside a warning icon, never by colour alone, and it sits in the thread where the answer would have been. Retry is the only action offered and it carries the failed turn\'s id, so the caller knows which turn to run again.',
      },
    },
  },
};
