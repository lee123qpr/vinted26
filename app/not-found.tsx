
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Material Not Found | Skipped',
};

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 text-center">
            <div className="relative mb-8 group cursor-default">
                {/* Animated decorative blob */}
                <div className="absolute -inset-4 bg-yellow-100 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-500 animate-pulse-slow"></div>

                {/* Icon */}
                <div className="relative transform group-hover:rotate-12 transition-transform duration-300">
                    <svg className="w-32 h-32 text-secondary-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    {/* Floating '?' badge */}
                    <div className="absolute -top-2 -right-2 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white font-black text-2xl border-4 border-white shadow-lg animate-bounce-soft">
                        ?
                    </div>
                </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-secondary-900 mb-4 tracking-tight">
                Material Not Found
            </h1>

            <p className="text-lg md:text-xl text-secondary-500 max-w-lg mb-10 leading-relaxed">
                Looks like this item has been skipped... or maybe it never started.
                The page you're looking for is missing from our inventory.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
                <Link
                    href="/"
                    className="flex-1 btn-primary py-3.5 text-lg justify-center shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 hover:-translate-y-1 transition-all"
                >
                    Back to Site
                </Link>
                <Link
                    href="/search"
                    className="flex-1 px-8 py-3.5 bg-white border-2 border-secondary-200 text-secondary-700 font-bold rounded-xl hover:border-secondary-900 hover:text-secondary-900 transition-all text-center"
                >
                    Search Items
                </Link>
            </div>

            <div className="mt-16 pt-8 border-t border-secondary-100 w-full max-w-xs mx-auto">
                <p className="text-secondary-400 text-sm font-mono">Error Code: 404</p>
            </div>
        </div>
    );
}
