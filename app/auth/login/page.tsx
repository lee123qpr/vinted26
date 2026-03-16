'use client';

import { useState } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Not needed with Server Actions redirect
import { login } from '../actions';

import TurnstileWidget from '@/components/TurnstileWidget';

export default function LoginPage() {
    // const router = useRouter(); 
    // We can rely on server action redirect, but for error handling we might want local state or useUrlState

    // For simplicity with standard form submission:
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string>('');

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        if (!turnstileToken) {
            setError("Please verify you are human");
            setLoading(false);
            return;
        }

        // Append token to formData manually since widget doesn&apos;t use hidden input
        formData.append('turnstileToken', turnstileToken);

        try {
            const result = await login(formData);
            if (result?.error) {
                setError(result.error);
                setTurnstileToken(''); // Reset token
                setLoading(false);
            }
        } catch (err: any) {
            // Next.js redirects throw errors that should not be caught as "unexpected"
            if (err?.digest?.includes('NEXT_REDIRECT')) {
                throw err;
            }
            console.error('Login error:', err);
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900">
                    Sign in to Skipped
                </h2>
                <p className="mt-2 text-center text-sm text-secondary-600">
                    Or{' '}
                    <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form action={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start">
                                <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-secondary-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link href="/auth/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <TurnstileWidget
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                            onVerify={(token) => setTurnstileToken(token)}
                        />

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>


                </div>
            </div>
        </div>
    );
}
