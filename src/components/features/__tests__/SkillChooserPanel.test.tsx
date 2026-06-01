import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import { SkillChooserPanel } from '../SkillChooserPanel';

describe('SkillChooserPanel', () => {
  it('shows the default recommendation for a new project', () => {
    render(createElement(SkillChooserPanel));

    expect(screen.getByRole('heading', { name: /your recommended path/i })).toBeInTheDocument();
    expect(screen.getByText(/Brainstorm first with a guided spec/i)).toBeInTheDocument();
    expect(screen.getByText(/brainstorming/i)).toBeInTheDocument();
    expect(screen.getByText(/docs\/superpowers\/specs/i)).toBeInTheDocument();
  });

  it('updates the recommendation when the user changes the setup', async () => {
    const user = userEvent.setup();

    render(createElement(SkillChooserPanel));

    await user.click(screen.getByLabelText(/debug an issue/i));
    await user.click(screen.getByLabelText(/rigorous/i));
    await user.click(screen.getByLabelText(/brownfield improvement/i));

    expect(screen.getByText(/Debug methodically before changing code/i)).toBeInTheDocument();
    expect(screen.getByText(/systematic-debugging/i)).toBeInTheDocument();
    expect(screen.getByText(/write the smallest repro or failing test/i)).toBeInTheDocument();
  });
});
