import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrandMark } from './brand-mark';

describe('BrandMark', () => {
  it('renders the wordmark by default', () => {
    render(<BrandMark />);
    expect(screen.getByText(/Fix/)).toBeInTheDocument();
    expect(screen.getByText(/It/)).toBeInTheDocument();
  });

  it('hides the wordmark when showWordmark is false', () => {
    render(<BrandMark showWordmark={false} />);
    expect(screen.queryByText(/Fix/)).not.toBeInTheDocument();
  });
});
