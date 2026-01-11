'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import TurnstileWidget from '@/components/TurnstileWidget';
import { signup } from '../actions';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState<string>('');

    // Username availability state
    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [usernameAvailable, setUsernameAvailable] = useState(false);

    const checkUsernameAvailability = async (username: string) => {
        if (username.length < 3) return;

        setCheckingUsername(true);
        setUsernameError(null);
        setUsernameAvailable(false);

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', username)
                .single();

            if (data) {
                setUsernameError('Username is already taken');
            } else {
                setUsernameAvailable(true);
            }
        } catch (err) {
            // .single() returns error if no rows found, which means username IS available
            setUsernameAvailable(true);
        } finally {
            setCheckingUsername(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (usernameError) {
            setError("Please choose a valid username");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            setLoading(false);
            return;
        }

        if (!turnstileToken) {
            setError("Please verify you are human");
            setLoading(false);
            return;
        }

        try {
            const payload = new FormData();
            payload.append('fullName', formData.fullName);
            payload.append('username', formData.username);
            payload.append('email', formData.email);
            payload.append('password', formData.password);
            payload.append('turnstileToken', turnstileToken);

            const result = await signup(payload);

            if (result?.error) {
                setError(result.error);
                // Reset token on failure so user has to verify again? 
                // Usually good practice, but Cloudflare might handle it.
                setTurnstileToken('');
                // We clear the token so the user must re-verify or the widget handles it.
            } else if (result?.success) {
                setSuccess(true);
            } else {
                // Redirect handled by Server Action
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
                        <p className="text-gray-600 mb-6">
                            We've sent a verification link to <strong>{formData.email}</strong>.<br />
                            Please click the link to activate your account.
                        </p>
                        <Link href="/auth/login" className="text-primary-600 hover:text-primary-500 font-medium">
                            Return to Sign In
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl">S</span>
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-secondary-900">
                    Create a Skipped account
                </h2>
                <p className="mt-2 text-center text-sm text-secondary-600">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <p className="mb-4 text-xs text-secondary-500 text-right"><span className="text-red-500">*</span> Indicates mandatory field</p>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-secondary-700">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
                                Username <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1 relative">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={formData.username}
                                    onChange={(e) => {
                                        setFormData({ ...formData, username: e.target.value });
                                        setUsernameAvailable(false);
                                        setUsernameError(null);
                                    }}
                                    onBlur={(e) => checkUsernameAvailability(e.target.value)}
                                    className={`input-field ${usernameError ? '!border-red-300 focus:!ring-red-500' : ''} ${usernameAvailable ? '!border-green-300 focus:!ring-green-500' : ''}`}
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    {checkingUsername && (
                                        <div className="animate-spin h-4 w-4 border-2 border-secondary-400 border-t-transparent rounded-full"></div>
                                    )}
                                    {usernameAvailable && !checkingUsername && (
                                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    {usernameError && !checkingUsername && (
                                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            {usernameError && (
                                <p className="mt-1 text-xs text-red-500">{usernameError}</p>
                            )}
                            {usernameAvailable && !checkingUsername && (
                                <p className="mt-1 text-xs text-green-600">Username available</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-secondary-700">
                                Email address <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary-700">
                                Confirm Password <span className="text-red-500">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <TurnstileWidget
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'}
                            onVerify={(token) => setTurnstileToken(token)}
                        />

                        <div className="text-xs text-secondary-500 text-center">
                            By clicking "Create Account", you agree to our{' '}
                            <Link href="/legal/terms" className="text-primary-600 hover:text-primary-500 underline" target="_blank">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/legal/privacy" className="text-primary-600 hover:text-primary-500 underline" target="_blank">
                                Privacy Policy
                            </Link>.
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !!usernameError}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
