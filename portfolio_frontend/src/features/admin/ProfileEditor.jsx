import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { apiClient } from '../../lib/api.js';
import { usePortfolio } from '../../context/PortfolioContext.jsx';
import { StatePanel } from '../../components/Ui.jsx';
import FormFields from './FormFields.jsx';
import { profileFields, toForm, toPayload } from './config.js';
export default function ProfileEditor({ notify }) {
  const { refresh } = usePortfolio();
  const [values, setValues] = useState(null);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError('');
    apiClient
      .get('profile')
      .then((data) => {
        if (active) setValues(toForm(data, profileFields));
      })
      .catch((failure) => {
        if (active) setError(failure.message);
      });
    return () => {
      active = false;
    };
  }, [attempt]);
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFieldErrors({});
    try {
      await apiClient.save('profile', toPayload(values, profileFields));
      notify('Profile saved.');
      refresh();
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
          <p className="eyebrow">Workspace / identity</p>
          <h1>Profile & About</h1>
          <p>Your introduction, biography, image, and key actions.</p>
        </div>
      </div>
      {error && (
        <div className="cms-error" role="alert">
          {error}
          {!values && (
            <button className="ml-3 underline" onClick={() => setAttempt(attempt + 1)}>
              Retry
            </button>
          )}
        </div>
      )}
      {values ? (
        <form onSubmit={save} className="cms-editor">
          <fieldset disabled={busy}>
            <FormFields
              fields={profileFields}
              values={values}
              errors={fieldErrors}
              onChange={(name, value) => setValues({ ...values, [name]: value })}
            />
          </fieldset>
          <div className="mt-6 flex justify-end">
            <button className="admin-primary" disabled={busy}>
              <Save size={16} />
              {busy ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      ) : (
        !error && <StatePanel loading title="Loading profile" />
      )}
    </section>
  );
}
