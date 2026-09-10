import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { sampleSuggestions } from '@/fixtures';
import { SuggestionChips } from './SuggestionChips';

describe('SuggestionChips', () => {
  it('reports the chosen prompt to the caller', async () => {
    const user = userEvent.setup();
    const onSuggestionSelect = vi.fn();
    render(
      <SuggestionChips
        suggestions={sampleSuggestions}
        onSuggestionSelect={onSuggestionSelect}
      />,
    );

    await user.click(screen.getByRole('button', { name: sampleSuggestions[1] }));

    expect(onSuggestionSelect).toHaveBeenCalledTimes(1);
    expect(onSuggestionSelect).toHaveBeenCalledWith(sampleSuggestions[1]);
  });

  it('exposes every prompt as a named control', () => {
    render(<SuggestionChips suggestions={sampleSuggestions} onSuggestionSelect={vi.fn()} />);

    const chips = screen.getAllByRole('button');

    expect(chips).toHaveLength(sampleSuggestions.length);
    expect(chips.map((chip) => chip.textContent)).toEqual([...sampleSuggestions]);
  });

  it('renders nothing when there are no suggestions', () => {
    render(<SuggestionChips suggestions={[]} onSuggestionSelect={vi.fn()} />);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
