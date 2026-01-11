import Link from 'next/link';
import Image from 'next/image';

export default function TrustSafetyPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-primary-900 text-white py-20">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Trust & Safety</h1>
                    <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                        Your security is our top priority. Learn how Skipped keeps you safe when buying and selling construction materials.
                    </p>
                </div>
            </section>

            {/* Main Pillars */}
            <section className="py-16">
                <div className="container-custom">
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Secure Payments */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3">Secure Payments</h3>
                            <p className="text-secondary-600">
                                All transactions are protected. We hold payments securely until you confirm you've received your item as described.
                            </p>
                        </div>

                        {/* Verified Community */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3">Verified Community</h3>
                            <p className="text-secondary-600">
                                We verify user profiles and encourage reviews. Check a seller's rating and feedback history before you buy.
                            </p>
                        </div>

                        {/* Support */}
                        <div className="text-center">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3">24/7 Support</h3>
                            <p className="text-secondary-600">
                                Our support team is always here to help. If something goes wrong, we'll step in to resolve the issue fairly.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Detailed Sections */}
            <section className="py-16 bg-secondary-50">
                <div className="container-custom">
                    <div className="max-w-3xl mx-auto space-y-16">

                        {/* Buyer Protection */}
                        <div>
                            <h2 className="text-3xl font-bold text-secondary-900 mb-6">Buyer Protection</h2>
                            <div className="bg-white p-8 rounded-xl shadow-sm border border-secondary-100">
                                <p className="text-lg text-secondary-700 mb-6">
                                    We want you to shop with confidence. That's why we offer comprehensive Buyer Protection on eligible purchases.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-secondary-600"><strong>Refund Guarantee:</strong> If your item never arrives, or is significantly different from its description, you're covered.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-secondary-600"><strong>Secure Payment Processing:</strong> Use credit cards, Apple Pay, or Google Pay securely. Sellers never see your financial details.</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-secondary-600"><strong>Dispute Resolution:</strong> If you can't resolve an issue with a seller, our specialized team will mediate.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Safety Tips */}
                        <div>
                            <h2 className="text-3xl font-bold text-secondary-900 mb-6">Safety Tips</h2>
                            <div className="grid gap-6">
                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary-500">
                                    <h3 className="text-lg font-bold text-secondary-900 mb-2">Platform Communication</h3>
                                    <p className="text-secondary-600">Always keep conversations inside the Skipped app. This provides a record of what was agreed upon if there is a dispute.</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary-500">
                                    <h3 className="text-lg font-bold text-secondary-900 mb-2">In-Person Collections</h3>
                                    <p className="text-secondary-600">When meeting to collect items, choose a public place or bring a friend if visiting a construction site. Inspect the item thoroughly before taking it.</p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-primary-500">
                                    <h3 className="text-lg font-bold text-secondary-900 mb-2">Avoid Scam Attempts</h3>
                                    <p className="text-secondary-600">Never share your personal email, phone number, or bank details before a sale is confirmed. Be wary of users asking to take payment off-platform.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold text-secondary-900 mb-6">Need help with an order?</h2>
                    <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
                        Visit our Help Centre for guides, or contact our support team directly.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <Link href="/help" className="btn-primary">
                            Visit Help Centre
                        </Link>
                        <Link href="/contact" className="px-6 py-3 bg-secondary-100 text-secondary-900 font-bold rounded hover:bg-secondary-200 transition">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
