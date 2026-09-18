import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import Showroom from './Showroom.jsx';
let items;
vi.mock('../context/PortfolioContext.jsx', () => ({
  usePortfolio: () => ({ content: { showroom: items } }),
}));
afterEach(cleanup);
const live = {
  _id: 'first',
  label: 'TypeWriter',
  presentationType: 'iframe',
  status: 'live',
  isDefault: true,
};
const upcoming = {
  _id: 'second',
  label: 'Next experiment',
  presentationType: 'coming-soon',
  status: 'coming-soon',
  description: 'A planned experience.',
};
const show = () =>
  render(
    <MemoryRouter>
      <Showroom />
    </MemoryRouter>,
  );
describe('showroom visitor experience', () => {
  it('shows an honest unavailable state without fabricating TypeWriter', () => {
    items = [live, upcoming];
    show();
    expect(screen.getByText('TypeWriter isn’t connected yet.')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
  it('supports CMS defaults and keyboard tab selection in both directions', () => {
    items = [
      { ...live, isDefault: false },
      { ...upcoming, isDefault: true },
    ];
    show();
    expect(screen.getByRole('tab', { name: /Next experiment/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(screen.getByRole('tab', { name: /Next experiment/ }), { key: 'ArrowLeft' });
    expect(screen.getByRole('tab', { name: /TypeWriter/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    fireEvent.keyDown(screen.getByRole('tab', { name: /TypeWriter/ }), { key: 'ArrowRight' });
    expect(within(screen.getByRole('tabpanel')).getByText('Coming soon')).toBeInTheDocument();
  });
  it('embeds only the selected real URL and offers recovery controls', () => {
    items = [
      {
        ...live,
        embedUrl: 'https://typewriter.example/sandbox',
        externalUrl: 'https://typewriter.example',
      },
      upcoming,
    ];
    show();
    expect(screen.getByTitle('TypeWriter live experience')).toHaveAttribute(
      'src',
      items[0].embedUrl,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Having trouble?' }));
    expect(screen.getByText(/blank or blocked window/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open full project/ })).toHaveAttribute(
      'href',
      items[0].externalUrl,
    );
  });
  it('handles empty showroom content', () => {
    items = [];
    show();
    expect(screen.getByText('The showroom is quiet for now')).toBeInTheDocument();
  });
});
