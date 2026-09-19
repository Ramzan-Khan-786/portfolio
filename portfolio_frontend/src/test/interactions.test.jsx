import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SiteHeader from '../components/SiteHeader.jsx';
import { ContentImage } from '../components/Ui.jsx';
import ResourceManager from '../features/admin/ResourceManager.jsx';
import Login from '../features/admin/Login.jsx';
import { apiClient } from '../lib/api.js';
vi.mock('../lib/api.js', () => ({
  apiClient: { get: vi.fn(), save: vi.fn(), adminLogin: vi.fn() },
}));
vi.mock('../context/PortfolioContext.jsx', () => ({
  usePortfolio: () => ({
    refresh: vi.fn(),
    content: {
      profile: { name: 'Ramzan', initials: 'RK' },
      navigation: [
        { _id: 'experience', label: 'Experience', type: 'route', destination: '/experience' },
      ],
    },
  }),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const show = (element) => render(<MemoryRouter>{element}</MemoryRouter>);
describe('critical UI interactions', () => {
  it('recovers a broken image when the CMS supplies a new URL', () => {
    const { rerender } = render(
      <ContentImage src="https://example.com/broken.png" alt="Profile" initials="RK" />,
    );
    fireEvent.error(screen.getByRole('img'));
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    rerender(
      <ContentImage src="https://example.com/replacement.png" alt="Profile" initials="RK" />,
    );
    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://example.com/replacement.png');
  });
  it('renders CMS navigation links and closes the mobile menu with Escape', () => {
    show(<SiteHeader />);
    expect(screen.getByRole('link', { name: 'Experience' })).toHaveAttribute('href', '/experience');
    fireEvent.click(screen.getByLabelText('Open menu'));
    expect(screen.getByLabelText('Mobile navigation')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByLabelText('Close menu'), { key: 'Escape' });
    expect(screen.queryByLabelText('Mobile navigation')).not.toBeInTheDocument();
  });
  it('shows login failures from the server', async () => {
    apiClient.adminLogin.mockRejectedValue(new Error('Invalid email or password.'));
    show(<Login onLogin={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password.');
  });
  it('edits populated showroom associations and sends a project ID', async () => {
    apiClient.get.mockImplementation((resource) =>
      Promise.resolve(
        resource === 'projects'
          ? [{ _id: 'project-id', title: 'Actual project', published: true }]
          : [
              {
                _id: 'show-id',
                label: 'Demo',
                project: { _id: 'project-id', title: 'Actual project' },
                enabled: true,
                isDefault: true,
                order: 0,
                presentationType: 'iframe',
                status: 'live',
              },
            ],
      ),
    );
    apiClient.save.mockResolvedValue({});
    show(<ResourceManager resource="showroom" notify={vi.fn()} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Edit Demo' }));
    expect(screen.getByLabelText('Associated project')).toHaveValue('project-id');
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() =>
      expect(apiClient.save).toHaveBeenCalledWith(
        'showroom',
        expect.objectContaining({ project: 'project-id', enabled: true, isDefault: true }),
        'show-id',
      ),
    );
  });
  it('renders server field errors next to inputs', async () => {
    apiClient.get.mockResolvedValue([]);
    apiClient.save.mockRejectedValue({
      message: 'Please correct the fields.',
      details: { fieldErrors: { destination: ['Invalid destination.'] } },
    });
    show(<ResourceManager resource="navigation" notify={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add navigation item' }));
    fireEvent.change(screen.getByLabelText(/Label/), { target: { value: 'Example' } });
    fireEvent.change(screen.getByLabelText(/^Destination \*/), { target: { value: 'invalid' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(await screen.findByText('Invalid destination.')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Destination \*/)).toHaveAttribute('aria-invalid', 'true');
  });
});
