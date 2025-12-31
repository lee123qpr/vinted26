'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
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
        <footer className="bg-secondary-900 text-white py-12 mt-20">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand & Description */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Skipped</h3>
                        <p className="text-secondary-300">
                            The UK's marketplace for construction materials. Buy, sell, and save the planet.
                        </p>
                    </div>

                    {/* Discover */}
                    <div>
                        <h4 className="font-semibold mb-4">Discover</h4>
                        <ul className="space-y-2 text-secondary-300">
                            <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
                            <li><Link href="/categories" className="hover:text-white transition">Browse Categories</Link></li>
                            <li><Link href="/dashboard/impact" className="hover:text-white transition">Sustainability</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h4 className="font-semibold mb-4">Help</h4>
                        <ul className="space-y-2 text-secondary-300">
                            <li><Link href="/help" className="hover:text-white transition">Help Centre</Link></li>
                            <li><Link href="/sell" className="hover:text-white transition">Selling</Link></li>
                            <li><Link href="/" className="hover:text-white transition">Buying</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter (Replaces 'About' in the original layout, or adds to it. 
             The original layout had 'About' as the 4th column. 
             I'll merge About links into 'Discover' or 'Help', or just keep About and make this a 5th column or row?
             Looking at the original layout, it was 4 columns.
             I'll modify the 4th column to be 'Stay Updated' and move useful About links elsewhere or keep them.
             Actually, usually Newsletter is a full width row or a prominent column.
             Let's keep the design clean: 4 columns. 
             Col 1: Brand
             Col 2: Discover (with About links merged in)
             Col 3: Help
             Col 4: Newsletter
          */}
                    <div>
                        <h4 className="font-semibold mb-4">Stay Updated</h4>
                        <p className="text-sm text-secondary-300 mb-4">
                            Get the latest updates on new materials and sustainability tips.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-2">
                            <div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    aria-label="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={status === 'loading' || status === 'success'}
                                    className="w-full px-4 py-2 text-primary-900 rounded bg-white border border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading' || status === 'success'}
                                className="w-full btn-primary py-2 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
                            </button>
                            {message && (
                                <p className={`text-xs mt-2 ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                                    {message}
                                </p>
                            )}
                        </form>
                        <div className="mt-6 text-sm text-secondary-400">
                            <Link href="/about" className="hover:text-white transition mr-4">About Us</Link>
                            <Link href="/contact" className="hover:text-white transition">Contact</Link>
                        </div>
                    </div>
                </div>

                {/* Legal Links Row */}
                <div className="border-t border-secondary-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-secondary-400">
                    <p>&copy; {new Date().getFullYear()} Skipped. All rights reserved.</p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link href="/legal/terms" className="hover:text-white transition">Terms</Link>
                        <Link href="/legal/privacy" className="hover:text-white transition">Privacy</Link>
                        <Link href="/legal/cookies" className="hover:text-white transition">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
