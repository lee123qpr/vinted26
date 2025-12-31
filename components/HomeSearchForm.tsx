'use client';

import { useRouter } from 'next/navigation';

export default function HomeSearchForm() {
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const query = formData.get('q') as string;
        const location = formData.get('location') as string;

        if (query?.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl p-2 shadow-xl flex flex-col md:flex-row gap-2"
        >
            <div className="flex-1 relative">
                <input
                    type="text"
                    name="q"
                    placeholder="What are you looking for?"
                    className="w-full px-4 py-3 text-secondary-900 rounded-lg focus:outline-none"
                />
            </div>
            <div className="relative">
                <input
                    type="text"
                    name="location"
                    placeholder="Location or postcode"
                    className="w-full md:w-64 px-4 py-3 text-secondary-900 rounded-lg focus:outline-none"
                />
                <svg className="absolute right-3 top-3.5 w-5 h-5 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            </div>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
                Search
            </button>
        </form>
    );
}
