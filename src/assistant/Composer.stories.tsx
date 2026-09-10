import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { Composer, type ComposerProps } from './Composer';

/** Holds the draft in the story, so the composer itself stays fully controlled. */
function ComposerDemo({ value: seed, ...args }: ComposerProps) {
  const [value, setValue] = useState(seed);

  return (
    <Composer
      {...args}
      value={value}
      onValueChange={(next) => {
        args.onValueChange?.(next);
        setValue(next);
      }}
      onSubmit={() => {
        args.onSubmit?.();
        setValue('');
      }}
    />
  );
}

const meta = {
  title: 'Assistant/Composer',
  component: Composer,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'The panel\'s input: one bounded block with the send control **inside** its outline, not',
          'beside it. The field, the hint and the button are one object, so the boundary of "where I',
          'type" is unambiguous.',
          '',
          'It is **controlled** and holds no state. The field grows with the draft up to about eight',
          'lines and then scrolls, because the thread and the composer share the panel\'s height — an',
          'uncapped field eats the conversation as you type. There is no fixed height anywhere: a',
          '`min-height` floor guarantees one line, and the content sets the rest.',
          '',
          'Switch the `status` control to `streaming` to see send become stop.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[396px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    status: {
      control: 'select',
      options: ['idle', 'streaming', 'error'],
      description: 'Panel state. While `streaming`, send is replaced by stop and Enter does not submit.',
    },
    placeholder: { control: 'text' },
    label: { control: 'text' },
    value: { control: 'text' },
    inputRef: { control: false },
  },
  args: {
    value: '',
    status: 'idle',
    onValueChange: fn(),
    onSubmit: fn(),
    onStop: fn(),
  },
  render: (args) => <ComposerDemo {...args} />,
} satisfies Meta<typeof Composer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The resting state. Send is disabled while the draft is empty or only whitespace, so the control never promises an action it would refuse. The hint reads "Enter to send" because that is what the key does right now.',
      },
    },
  },
};

export const Drafting: Story = {
  args: { value: 'Which scores support the attention finding?' },
  parameters: {
    docs: {
      description: {
        story: 'A draft in progress. Send is now live. Type into the field to watch it grow line by line.',
      },
    },
  },
};

export const Streaming: Story = {
  args: { status: 'streaming' },
  parameters: {
    docs: {
      description: {
        story:
          'While an answer is arriving, send is replaced by stop and Enter no longer submits, so a second turn cannot be queued on top of the first. The hint changes with it — it now says "Esc to stop", because an interface should not promise a key that does nothing.',
      },
    },
  },
};

export const LongDraft: Story = {
  args: {
    value: [
      'Compare the working memory scores against the rest of the battery,',
      'say which subtest is the outlier, and rewrite the impression paragraph',
      'so a parent could read it without losing the clinical meaning.',
      'Keep the citations attached to whatever you assert.',
      'Then list anything the report does not yet support.',
    ].join('\n'),
  },
  parameters: {
    docs: {
      description: {
        story:
          'A draft past the growth cap. The field stops at roughly eight lines and scrolls instead of pushing the thread off the panel. Add more lines with the `value` control to confirm the ceiling holds.',
      },
    },
  },
};
