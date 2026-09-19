import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/api.js';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null),
    [checking, setChecking] = useState(true),
    [error, setError] = useState(''),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setChecking(true);
    setError('');
    apiClient
      .me()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch((failure) => {
        if (active) {
          if (failure.status === 401) setUser(null);
          else setError(failure.message);
        }
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    const expired = () => setUser(null);
    window.addEventListener('portfolio:session-expired', expired);
    return () => {
      active = false;
      window.removeEventListener('portfolio:session-expired', expired);
    };
  }, [attempt]);
  async function logout() {
    try {
      await apiClient.logout();
    } catch (failure) {
      if (failure.status !== 401) throw failure;
    }
    setUser(null);
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: (value) => {
          setUser(value);
          setError('');
        },
        checking,
        error,
        logout,
        retry: () => setAttempt((v) => v + 1),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
