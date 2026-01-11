'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check local storage on mount
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'granted');
        setShowBanner(false);
        // Optional: Trigger Google Analytics or other trackers here
    };

    const handleDecline = () => {
        localStorage.setItem('cookie_consent', 'denied');
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 md:p-6 z-[9999]">
            <div className="container-custom flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary-900 mb-2">We value your privacy</h3>
                    <p className="text-sm text-secondary-600">
                        We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                        By clicking "Accept All", you consent to our use of cookies in accordance with UK law.
                        Read our <Link href="/legal/cookies" className="text-primary-600 hover:underline">Cookie Policy</Link>.
                    </p>
                </div>
                <div className="flex flex-row space-x-3 whitespace-nowrap">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-50 transition text-sm font-medium"
                    >
                        Necessary Only
                    </button>
                    <button
                        onClick={handleAccept}
                        className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition text-sm font-bold shadow-sm"
                    >
                        Accept All
                    </button>
                </div>
            </div>
        </div>
    );
}
