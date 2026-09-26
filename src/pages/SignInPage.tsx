import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export function SignInPage() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    try {
      await signIn(email, password);
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || 'Unable to sign in.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Enter your email first to reset your password.');
      return;
    }

    try {
      await resetPassword(email);
      setMessage('Password reset email sent.');
    } catch (error) {
      const err = error as Error;
      setMessage(err.message || 'Unable to send reset email.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-500 text-xl font-bold text-white">
            W
          </div>
          <h1 className="mt-4 text-2xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to your employee account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-primary-500"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-primary-500"
              required
            />
          </div>

          {message ? <p className="text-sm text-slate-600">{message}</p> : null}

          <Button type="submit" className="w-full">Sign In</Button>
          <button
            type="button"
            onClick={handleForgotPassword}
            className="w-full text-center text-sm text-primary-700 underline"
          >
            Forgot password?
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          No account yet?{' '}
          <Link to="/signup" className="font-semibold text-primary-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
