import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { apiClient } from '../../lib/api.js';
import FormFields from './FormFields.jsx';
const fields = [
  { name: 'email', label: 'Email', type: 'email', required: true, autoComplete: 'username' },
  {
    name: 'password',
    label: 'Password',
    type: 'password',
    required: true,
    minLength: 8,
    autoComplete: 'current-password',
  },
];
export default function Login({ onLogin }) {
  const [values, setValues] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const data = await apiClient.adminLogin(values);
      onLogin(data.user);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="cms-login">
      <Link className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-moss" to="/">
        <ArrowLeft size={16} />
        Back to portfolio
      </Link>
      <form className="cms-editor w-full" onSubmit={submit}>
        <p className="eyebrow">Engineering portfolio / CMS</p>
        <h1 className="mb-2 text-3xl font-medium tracking-tight">Welcome back.</h1>
        <p className="mb-7 text-sm text-stone-600">Sign in to manage your portfolio.</p>
        <fieldset disabled={busy}>
          <FormFields
            fields={fields}
            values={values}
            onChange={(key, value) => setValues({ ...values, [key]: value })}
          />
        </fieldset>
        {error && (
          <p role="alert" className="cms-error">
            {error}
          </p>
        )}
        <button className="admin-primary mt-6 w-full justify-center" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
