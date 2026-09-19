import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiClient } from '../lib/api.js';
import GoogleSignIn from '../components/GoogleSignIn.jsx';
import Metadata from '../components/Metadata.jsx';
import FormFields from '../features/admin/FormFields.jsx';
import './AuthPage.css';
const email = {
  name: 'email',
  label: 'Email',
  type: 'email',
  required: true,
  autoComplete: 'username',
  maxLength: 254,
};
export default function AuthPage({ mode }) {
  const { user, setUser } = useAuth(),
    navigate = useNavigate();
  const signup = mode === 'signup';
  const [values, setValues] = useState({ name: '', email: '', password: '' }),
    [pending, setPending] = useState(null),
    [error, setError] = useState(''),
    [errors, setErrors] = useState({}),
    [busy, setBusy] = useState(false),
    [googleKey, setGoogleKey] = useState(0);
  if (user) return <Navigate to="/account" replace />;
  const creating = pending ? pending.step === 'create' : signup;
  const password = {
    name: 'password',
    label:
      pending?.step === 'link'
        ? 'Current portfolio password'
        : pending
          ? 'New portfolio password'
          : 'Password',
    type: 'password',
    required: true,
    minLength: creating ? 12 : 8,
    maxLength: creating ? 72 : 128,
    autoComplete: creating ? 'new-password' : 'current-password',
    help: creating
      ? 'At least 12 characters, up to 72 UTF-8 bytes. Use a unique password.'
      : undefined,
  };
  const fields = pending
    ? [password]
    : [
        ...(signup
          ? [
              {
                name: 'name',
                label: 'Name',
                required: true,
                minLength: 2,
                maxLength: 80,
                autoComplete: 'name',
              },
            ]
          : []),
        email,
        password,
      ];
  function result(data) {
    if (data.user) {
      setUser(data.user);
      navigate('/account', { replace: true });
    } else {
      setPending(data);
      setValues((v) => ({ ...v, password: '' }));
      setError('');
    }
  }
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    setErrors({});
    try {
      result(
        pending
          ? await apiClient.completeGoogle({ password: values.password })
          : signup
            ? await apiClient.signup(values)
            : await apiClient.login({ email: values.email, password: values.password }),
      );
    } catch (e) {
      setError(e.message);
      setErrors(e.details?.fieldErrors || {});
    } finally {
      setBusy(false);
    }
  }
  const title = pending
    ? pending.step === 'link'
      ? 'Link your account'
      : 'Create your portfolio password'
    : signup
      ? 'Create an account'
      : 'Welcome back';
  return (
    <section className="shell auth-page">
      <Metadata title={title} />
      <aside className="auth-intro">
        <p className="eyebrow">Portfolio / account</p>
        <h1>{title}</h1>
        <p>
          {pending
            ? pending.step === 'link'
              ? 'Confirm your existing portfolio password to securely connect Google.'
              : 'This is a new password for this portfolio account — not your Google password. You can use it to sign in with email later.'
            : signup
              ? 'One account for this portfolio. Browse the work and showroom without signing in, or create an account for future account-based features.'
              : 'Sign in with your portfolio email and password, or a linked Google identity.'}
        </p>
        <Link to="/" className="text-link">
          Back to portfolio ↗
        </Link>
      </aside>
      <div className="auth-panel">
        {pending && (
          <p className="auth-verified">
            Google identity verified
            <br />
            <strong>{pending.email}</strong>
          </p>
        )}
        <form onSubmit={submit}>
          <fieldset disabled={busy}>
            <FormFields
              fields={fields}
              values={values}
              errors={errors}
              onChange={(name, value) => setValues({ ...values, [name]: value })}
            />
          </fieldset>
          {error && (
            <p className="cms-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary-action w-full mt-6" disabled={busy}>
            {busy
              ? 'Please wait…'
              : pending
                ? pending.step === 'link'
                  ? 'Link Google and sign in'
                  : 'Set password and create account'
                : signup
                  ? 'Create account'
                  : 'Sign in'}
          </button>
        </form>
        {pending ? (
          <button
            className="text-link mt-5"
            disabled={busy}
            onClick={() => {
              setPending(null);
              setValues((v) => ({ ...v, password: '' }));
              setError('');
              setGoogleKey(googleKey + 1);
            }}
          >
            Cancel and start again
          </button>
        ) : (
          <>
            <div className="auth-divider">
              <span>or</span>
            </div>
            <GoogleSignIn key={googleKey} onResult={result} />
            <p className="auth-switch">
              {signup ? 'Already registered?' : 'New here?'}{' '}
              <Link to={signup ? '/login' : '/signup'}>
                {signup ? 'Sign in' : 'Create an account'}
              </Link>
            </p>
          </>
        )}
      </div>
    </section>
  );
}
