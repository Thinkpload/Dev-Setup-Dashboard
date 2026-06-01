import { render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import HomePage from '../page';

vi.mock('@/components/shared/Navbar', () => ({
  Navbar: () => createElement('div', { 'data-testid': 'navbar-stub' }),
}));

describe('HomePage', () => {
  it('renders the skill chooser homepage experience', () => {
    render(createElement(HomePage));

    expect(
      screen.getByRole('heading', { name: /choose the right build path before you code/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your recommended path/i })).toBeInTheDocument();
    expect(screen.queryByText(/Production-Ready AI/i)).not.toBeInTheDocument();
  });
});
