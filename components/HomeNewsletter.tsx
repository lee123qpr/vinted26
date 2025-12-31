'use client';

import { useState } from 'react';

export default function HomeNewsletter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus('loading');
        setMessage('');

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setStatus('success');
            setMessage(data.message);
            setEmail('');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    return (
        <section className="py-16 bg-white">
            <div className="container-custom">
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-xl p-8 md:p-12 text-white text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
                    <p className="text-primary-100 mb-6 text-lg">
                        Get weekly updates on new listings in your area, sustainability tips, and exclusive deals
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={status === 'loading' || status === 'success'}
                            className="flex-1 px-4 py-3 rounded-lg bg-white text-secondary-900 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-80"
                            required
                        />
                        <button
                            type="submit"
                            disabled={status === 'loading' || status === 'success'}
                            className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors whitespace-nowrap disabled:opacity-80 disabled:cursor-not-allowed"
                        >
                            {status === 'loading' ? '...' : status === 'success' ? 'Joined!' : 'Subscribe'}
                        </button>
                    </form>
                    {message && (
                        <p className={`text-sm mt-4 font-medium ${status === 'error' ? 'text-red-200' : 'text-green-200'}`}>
                            {message}
                        </p>
                    )}
                    <p className="text-xs text-primary-200 mt-4">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </div>
            </div>
        </section>
    );
}
