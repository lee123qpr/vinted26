'use client';

import { useState } from 'react';

export default function ShareButtons({ title, url }: { title: string, url: string }) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: title,
                    text: `Check out this article: ${title}`,
                    url: url,
                });
            } catch (err) {
                // User cancelled or error
            }
        } else {
            handleCopy();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center space-x-4 py-6 border-t border-b border-gray-100 my-8">
            <span className="text-secondary-500 text-sm font-semibold uppercase tracking-wider">Share this article:</span>

            <button
                onClick={handleShare}
                className="btn-secondary text-sm py-2 px-4 rounded-full flex items-center space-x-2 hover:bg-secondary-200 transition-colors"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                <span>Share</span>
            </button>

            <button
                onClick={handleCopy}
                className="text-secondary-500 hover:text-primary-600 transition-colors"
                title="Copy Link"
            >
                {copied ? (
                    <span className="text-green-600 font-medium text-sm">Copied!</span>
                ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                )}
            </button>
        </div>
    );
}
