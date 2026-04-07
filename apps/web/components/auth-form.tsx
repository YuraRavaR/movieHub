'use client';

import { useState } from 'react';
import { login, signup } from '@/lib/auth-api';
import { useRouter } from 'next/navigation';

type AuthMode = 'login' | 'signup';

type AuthFormProps = {
  mode: AuthMode;
};

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalizedEmail = email.trim();
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);
  const passwordValid = password.length >= 8;
  const emailError = !emailValid ? 'Enter a valid email address.' : null;
  const passwordError = !passwordValid ? 'Password must be at least 8 characters.' : null;
  const hasValidationErrors = !emailValid || !passwordValid;

  const submit = async () => {
    setEmailTouched(true);
    setPasswordTouched(true);
    if (hasValidationErrors) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (mode === 'signup') {
        await signup(normalizedEmail, password);
      } else {
        await login(normalizedEmail, password);
      }
      router.push('/search');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-panel mx-auto w-full max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-bold text-blue-100">
        {mode === 'signup' ? 'Create account' : 'Login'}
      </h1>
      <input
        className="w-full rounded-md border border-blue-800/70 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailTouched(true)}
      />
      {emailTouched && emailError ? (
        <p className="text-xs text-amber-300">{emailError}</p>
      ) : null}
      <input
        className="w-full rounded-md border border-blue-800/70 bg-slate-900 px-3 py-2 text-sm text-slate-100"
        placeholder="Password (min 8 chars)"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setPasswordTouched(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') void submit();
        }}
      />
      {passwordTouched && passwordError ? (
        <p className="text-xs text-amber-300">{passwordError}</p>
      ) : null}
      {error ? (
        <p className="rounded-md border border-red-500/50 bg-red-950/40 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}
      <button
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => void submit()}
        disabled={loading || hasValidationErrors}
      >
        {loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Login'}
      </button>
    </div>
  );
}
