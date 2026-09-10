import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { sampleSuggestions } from '@/fixtures';
import { SuggestionChips } from './SuggestionChips';

const meta = {
  title: 'Assistant/SuggestionChips',
  component: SuggestionChips,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: [
          'Prompts offered in the panel\'s empty state, when there is no history to read yet.',
          '',
          'Choosing a chip is a **submit path**, not a way to fill the field: `onSuggestionSelect`',
          'fires with the prompt and the caller sends it. Chips rest on the neutral slate scale and',
          'hover one step up it, so the chip lifts rather than changes colour — `Button`\'s `secondary`',
          'fill would put a lime label on a dark green pill in the dark theme.',
          '',
          'Renders a `ul` with an accessible name, so a screen reader announces how many prompts',
          'there are before reading them. With an empty list it renders nothing at all.',
        ].join('\n'),
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[380px]">
        <Story />
      </div>
    ),
  ],
  argTypes: {
    suggestions: { control: 'object' },
    label: { control: 'text' },
  },
  args: {
    suggestions: sampleSuggestions,
    onSuggestionSelect: fn(),
  },
} satisfies Meta<typeof SuggestionChips>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The three fixture prompts at the width they get inside the panel. Edit the `suggestions` control to see how the list reflows.',
      },
    },
  },
};

export const LongPrompts: Story = {
  args: {
    suggestions: [
      'Compare the working memory scores against the rest of the battery and say which one is the outlier',
      'Rewrite the impression for a parent audience',
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          'A prompt longer than the panel is wide. Chips wrap their own text rather than truncating it or forcing the panel wider — a clipped prompt is one the clinician cannot evaluate before choosing it.',
      },
    },
  },
};

export const SinglePrompt: Story = {
  args: { suggestions: ['Summarize the impression in two sentences'] },
  parameters: {
    docs: {
      description: {
        story: 'One prompt. The row stays centred, so a single chip does not read as left-aligned debris.',
      },
    },
  },
};

export const NoPrompts: Story = {
  args: { suggestions: [] },
  parameters: {
    docs: {
      description: {
        story:
          'With no prompts the component renders nothing — not an empty list with a name a screen reader would still announce. The empty state above it keeps its greeting, so the panel never shows a labelled container with nothing in it.',
      },
    },
  },
};
