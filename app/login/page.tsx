// app/login/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  // 🔑 Auto-redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  // 🔑 Handle Google login error from URL (optional)
  useEffect(() => {
    const errorParam = searchParams?.get('test');
    if (errorParam) {
      setError('Google login failed. Please try again.');
    }
  }, [searchParams]);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const res = await signIn('credentials', {
      username,
      password,
      redirect: false, // ✅ Works for credentials
    });

    if (res?.ok) {
      router.push('/dashboard');
    } else {
      setError(res?.error === 'CredentialsSignin' 
        ? 'Invalid username or password' 
        : 'Login failed');
    }
  };

  const handleGoogleLogin = () => {
    setError('');
    setIsGoogleLogin(true);
    // ❌ Do NOT use { redirect: false } for OAuth providers
    signIn('google', { 
      callbackUrl: '/dashboard' // ✅ Redirect here after success
    });
    // Note: signIn returns immediately; actual login happens after redirect
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleCredentialsLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="text-red-600 text-sm text-center">{error}</div>}

          <div>
            <button
              type="submit"
              disabled={isGoogleLogin}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="flex items-center justify-center">
          <button
            onClick={handleGoogleLogin}
            disabled={isGoogleLogin}
            className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-75"
          >
            {isGoogleLogin ? 'Redirecting...' : 'Login with Google'}
          </button>
        </div>
      </div>
    </div>
  );
}