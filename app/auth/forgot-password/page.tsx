'use client';

import { useState } from 'react';
import Link from 'next/link';
import { forgotPassword } from '../actions';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [turnstileToken, setTurnstileToken] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (!turnstileToken) {
            setMessage({ type: 'error', text: 'Please verify you are human.' });
            setLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('email', email);
        formData.append('turnstileToken', turnstileToken);

        try {
            const result = await forgotPassword(formData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: result.message || 'Check your email for a reset link.' });
                setEmail(''); // Clear email to prevent double submit confusion
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' });
        } finally {
            setLoading(false);
            setTurnstileToken(''); // Clear token after submit
        }
    };

    return (
        <div className="min-h-screen bg-secondary-50 flex flex-col justify-start pt-24 pb-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-secondary-900">Forgot your password?</h2>
                        <p className="mt-2 text-sm text-secondary-600">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {message && (
                            <div className={`p-4 border rounded-lg text-sm flex items-start ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                                {message.type === 'success' ? (
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                ) : (
                                    <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                )}
                                <span>{message.text}</span>
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
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <TurnstileWidget
                            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''}
                            onVerify={(token) => setTurnstileToken(token)}
                        />

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !turnstileToken}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Sending Link...' : 'Send Reset Link'}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                                Back to Sign In
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
