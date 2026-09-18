import { useState } from 'react';
import { apiClient } from '../../lib/api.js';
import FormFields from './FormFields.jsx';
const fields = [
  {
    name: 'currentPassword',
    label: 'Current password',
    type: 'password',
    required: true,
    autoComplete: 'current-password',
  },
  {
    name: 'newPassword',
    label: 'New password',
    type: 'password',
    required: true,
    minLength: 12,
    maxLength: 72,
    autoComplete: 'new-password',
    help: 'Use at least 12 characters, up to 72 UTF-8 bytes. Other sessions will be signed out.',
  },
];
export default function Account({ notify }) {
  const [values, setValues] = useState({ currentPassword: '', newPassword: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFieldErrors({});
    try {
      await apiClient.password(values);
      setValues({ currentPassword: '', newPassword: '' });
      notify('Password updated. Other sessions were revoked.');
    } catch (failure) {
      setError(failure.message);
      setFieldErrors(failure.details?.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }
  return (
    <section>
      <div className="cms-page-heading">
        <div>
          <p className="eyebrow">Workspace / security</p>
          <h1>Account</h1>
          <p>Keep access to your portfolio secure.</p>
        </div>
      </div>
      <form className="cms-editor" onSubmit={save}>
        <fieldset disabled={busy}>
          <FormFields
            fields={fields}
            values={values}
            errors={fieldErrors}
            onChange={(key, value) => setValues({ ...values, [key]: value })}
          />
        </fieldset>
        {error && (
          <p role="alert" className="cms-error">
            {error}
          </p>
        )}
        <button className="admin-primary mt-6" disabled={busy}>
          {busy ? 'Updating…' : 'Change password'}
        </button>
      </form>
    </section>
  );
}
