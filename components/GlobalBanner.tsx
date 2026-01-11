'use client';

import { useState } from 'react';

export default function GlobalBanner({ text }: { text: string | null }) {
    const [isVisible, setIsVisible] = useState(true);

    if (!text || !isVisible) return null;

    return (
        <div className="bg-slate-900 text-white px-4 py-3 relative z-50 transition-transform duration-500 ease-in-out">
            <div className="container-custom flex justify-between items-center">
                <p className="text-sm font-bold text-center w-full">
                    {text}
                </p>
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute right-4 text-slate-400 hover:text-white transition-colors"
                    aria-label="Dismiss banner"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
}
