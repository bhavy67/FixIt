import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileNav } from './mobile-nav';

describe('MobileNav', () => {
  it('opens the drawer and shows nav items on trigger click', async () => {
    const user = userEvent.setup();
    render(<MobileNav />);

    const trigger = screen.getByRole('button', { name: /open menu/i });
    await user.click(trigger);

    expect(await screen.findByRole('link', { name: 'Tools' })).toBeInTheDocument();
  });
});
