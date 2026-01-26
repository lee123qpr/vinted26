
'use client'; // Error components must be Client Components

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="relative mb-8">
                <div className="absolute -inset-4 bg-red-100 rounded-full blur-xl opacity-70 animate-pulse"></div>
                <div className="relative">
                    <svg className="w-32 h-32 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-secondary-900 mb-4 tracking-tight">
                Structural Failure
            </h1>

            <p className="text-lg text-secondary-500 max-w-lg mb-10 leading-relaxed">
                Something went wrong on our end. We've dispatched our site engineers to inspect the damage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                <button
                    onClick={reset}
                    className="flex-1 btn-primary py-3.5 text-lg justify-center shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all"
                >
                    Try Again
                </button>
                <button
                    onClick={() => window.location.href = '/'}
                    className="flex-1 px-8 py-3.5 bg-white border-2 border-secondary-200 text-secondary-700 font-bold rounded-xl hover:border-secondary-900 hover:text-secondary-900 transition-all"
                >
                    Go Back Home
                </button>
            </div>

            {error.digest && (
                <div className="mt-12 p-4 bg-secondary-50 rounded-lg border border-secondary-100 max-w-sm mx-auto">
                    <p className="text-xs text-secondary-400 font-mono mb-1 uppercase tracking-wider">Error Reference</p>
                    <code className="text-xs font-mono text-secondary-600 block bg-white p-2 rounded border border-secondary-200">
                        {error.digest}
                    </code>
                </div>
            )}
        </div>
    );
}
