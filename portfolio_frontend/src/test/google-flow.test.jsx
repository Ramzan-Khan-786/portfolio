import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, afterEach } from 'vitest';
import AuthPage from '../pages/AuthPage.jsx';
import { apiClient } from '../lib/api.js';
const setUser = vi.hoisted(() => vi.fn());
let step = 'create';
vi.mock('../context/AuthContext.jsx', () => ({ useAuth: () => ({ user: null, setUser }) }));
vi.mock('../context/PortfolioContext.jsx', () => ({
  usePortfolio: () => ({ content: { settings: [] } }),
}));
vi.mock('../lib/api.js', () => ({ apiClient: { completeGoogle: vi.fn() } }));
// A controlled component boundary tests our UI only; it is not Google verification.
vi.mock('../components/GoogleSignIn.jsx', () => ({
  default: ({ onResult }) => (
    <button
      onClick={() =>
        onResult({ step, email: 'verified@example.test', name: 'Verified test identity' })
      }
    >
      Test verified identity
    </button>
  ),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  step = 'create';
});
function show() {
  render(
    <MemoryRouter>
      <AuthPage mode="signup" />
    </MemoryRouter>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Test verified identity' }));
}
describe('Google password completion UI', () => {
  it('explicitly requests a new portfolio password, not the Google password', async () => {
    show();
    expect(screen.getByText(/not your Google password/)).toBeInTheDocument();
    expect(setUser).not.toHaveBeenCalled();
    apiClient.completeGoogle.mockResolvedValue({ user: { id: 'test-user', role: 'user' } });
    fireEvent.change(screen.getByLabelText(/^New portfolio password/), {
      target: { value: 'new-portfolio-password-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set password and create account' }));
    await waitFor(() => expect(setUser).toHaveBeenCalled());
    expect(apiClient.completeGoogle).toHaveBeenCalledWith({
      password: 'new-portfolio-password-123',
    });
  });
  it('requires the existing portfolio password when linking, including legacy eight-character passwords', async () => {
    step = 'link';
    show();
    const input = screen.getByLabelText(/^Current portfolio password/);
    expect(input).toHaveAttribute('minlength', '8');
    apiClient.completeGoogle.mockResolvedValue({ user: { id: 'linked-user', role: 'user' } });
    fireEvent.change(input, { target: { value: 'legacy12' } });
    fireEvent.click(screen.getByRole('button', { name: 'Link Google and sign in' }));
    await waitFor(() =>
      expect(apiClient.completeGoogle).toHaveBeenCalledWith({ password: 'legacy12' }),
    );
  });
  it('keeps an expired/failed completion unauthenticated and presents a restart action', async () => {
    show();
    apiClient.completeGoogle.mockRejectedValue(
      new Error('Google sign-in expired. Please start again.'),
    );
    fireEvent.change(screen.getByLabelText(/^New portfolio password/), {
      target: { value: 'new-portfolio-password-123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Set password and create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Google sign-in expired');
    expect(setUser).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Cancel and start again' })).toBeEnabled();
  });
});
