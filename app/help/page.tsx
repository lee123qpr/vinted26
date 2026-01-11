import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Help Centre | Skipped Support',
    description: 'Find answers to your questions about buying, selling, and shipping on Skipped. Browse our help topics or contact support.',
};

export default function HelpPage() {
    const categories = [
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
            ),
            title: "Buying",
            description: "How to find items, make offers, and pay securely.",
            href: "/faq?category=buying"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Selling",
            description: "Listing guides, pricing tips, and getting paid.",
            href: "/faq?category=selling"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
            ),
            title: "Shipping & Delivery",
            description: "Collection, local delivery, and courier options explained.",
            href: "/faq?category=shipping"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            title: "Trust & Safety",
            description: "Buyer protection, disputes, and account security.",
            href: "/faq?category=safety"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            title: "Account & Profile",
            description: "Managing your settings, notifications, and verification.",
            href: "/faq?category=account"
        },
        {
            icon: (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            title: "Rules & Policies",
            description: "Prohibited items, community guidelines, and terms.",
            href: "/legal/terms"
        }
    ];

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Hero Search */}
            <div className="bg-secondary-900 text-white py-20">
                <div className="container-custom text-center">
                    <h1 className="text-4xl font-bold mb-6">How can we help?</h1>
                    <div className="max-w-2xl mx-auto relative">
                        <input
                            type="text"
                            placeholder="Describe your issue (e.g., 'refund', 'delivery')"
                            className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-secondary-900 focus:outline-none focus:ring-4 focus:ring-primary-500/50 shadow-lg text-lg"
                        />
                        <svg className="w-6 h-6 text-secondary-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Help Categories */}
            <div className="container-custom -mt-8 relative z-10 pb-20">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat, index) => (
                        <Link
                            key={index}
                            href={cat.href}
                            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-secondary-100 group"
                        >
                            <div className="w-14 h-14 bg-secondary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-50 group-hover:scale-110 transition-all">
                                {cat.icon}
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-2">{cat.title}</h3>
                            <p className="text-secondary-600">{cat.description}</p>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Contact CTA */}
            <div className="container-custom pb-20 text-center">
                <h2 className="text-2xl font-bold text-secondary-900 mb-4">Can't find what you're looking for?</h2>
                <p className="text-secondary-600 mb-8">Our support team is just a click away.</p>
                <Link
                    href="/contact"
                    className="btn-primary inline-flex items-center px-8 py-3 rounded-lg"
                >
                    Contact Support
                </Link>
            </div>
        </div>
    );
}
