'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HowItWorksClient() {
    const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('seller');

    return (
        <div className="min-h-screen bg-secondary-50">
            {/* Hero Section */}
            <div className="relative bg-secondary-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/images/how-it-works/hero.png"
                        alt="Background"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-secondary-900/80 to-secondary-900/40" />

                <div className="container-custom relative z-10 py-20 md:py-32 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
                        How Skipped Works
                    </h1>
                    <p className="text-xl md:text-2xl text-secondary-200 max-w-3xl mx-auto mb-10 animate-fade-in-up delay-100">
                        The easiest way to buy and sell surplus construction materials.
                        Stop waste, save money, and build better.
                    </p>

                    {/* Toggle Switch */}
                    <div className="inline-flex bg-white/10 p-1 rounded-full backdrop-blur-sm border border-white/20 animate-fade-in-up delay-200">
                        <button
                            onClick={() => setActiveTab('seller')}
                            className={`px-8 py-3 rounded-full text-lg font-bold transition-all ${activeTab === 'seller' ? 'bg-primary-500 text-white shadow-lg scale-105' : 'text-secondary-200 hover:text-white'
                                }`}
                        >
                            I want to sell
                        </button>
                        <button
                            onClick={() => setActiveTab('buyer')}
                            className={`px-8 py-3 rounded-full text-lg font-bold transition-all ${activeTab === 'buyer' ? 'bg-primary-500 text-white shadow-lg scale-105' : 'text-secondary-200 hover:text-white'
                                }`}
                        >
                            I want to buy
                        </button>
                    </div>
                </div>
            </div>

            {/* Steps Section */}
            <section className="py-20">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold text-center text-secondary-900 mb-16">
                        {activeTab === 'seller' ? 'Turn Waste into Revenue' : 'Source Materials for Less'}
                    </h2>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[100px] left-[16%] right-[16%] h-1 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 rounded-full -z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 text-center group">
                            <div className="w-48 h-48 mx-auto bg-white rounded-full shadow-lg border-4 border-secondary-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary-400 transition-all duration-300">
                                <div className="relative w-24 h-24">
                                    <Image
                                        src={activeTab === 'seller' ? "/images/how-it-works/hero.png" : "/images/how-it-works/find.png"} // Reusing hero for Step 1 seller as placeholder or specific image if tailored
                                        alt="Step 1"
                                        fill
                                        className="object-contain"
                                        style={{ filter: activeTab === 'seller' ? 'hue-rotate(45deg)' : '' }} // Slight visual diff
                                    />
                                    {/* Override visuals slightly since we have limited generated assets */}
                                    {activeTab === 'seller' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white">
                                            <span className="text-6xl">📸</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mx-auto -mt-16 mb-6 relative z-20 border-4 border-white">1</div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3">
                                {activeTab === 'seller' ? 'List in Seconds' : 'Find Materials'}
                            </h3>
                            <p className="text-secondary-600">
                                {activeTab === 'seller'
                                    ? 'Snap a photo, add a description, and set your price. It’s free to list.'
                                    : 'Search for bricks, timber, or insulation near you. Filter by location and price.'}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 text-center group">
                            <div className="w-48 h-48 mx-auto bg-white rounded-full shadow-lg border-4 border-secondary-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary-400 transition-all duration-300">
                                <div className="relative w-24 h-24">
                                    <Image
                                        src="/images/how-it-works/offer.png"
                                        alt="Step 2"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                            </div>
                            <div className="bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mx-auto -mt-16 mb-6 relative z-20 border-4 border-white">2</div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3">
                                {activeTab === 'seller' ? 'Accept an Offer' : 'Make a Deal'}
                            </h3>
                            <p className="text-secondary-600">
                                {activeTab === 'seller'
                                    ? 'Receive offers from local buyers. Chat securely and agree on a price.'
                                    : 'Make an offer or buy instantly. Your money is held securely until you get the item.'}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 text-center group">
                            <div className="w-48 h-48 mx-auto bg-white rounded-full shadow-lg border-4 border-secondary-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-primary-400 transition-all duration-300">
                                <div className="relative w-24 h-24">
                                    <Image
                                        src={activeTab === 'seller' ? "/images/how-it-works/hero.png" : "/images/how-it-works/impact.png"} // Reusing impact for buyer end, seller gets paid
                                        alt="Step 3"
                                        fill
                                        className="object-contain"
                                    />
                                    {activeTab === 'seller' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white">
                                            <span className="text-6xl">💸</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-primary-100 text-primary-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mx-auto -mt-16 mb-6 relative z-20 border-4 border-white">3</div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3">
                                {activeTab === 'seller' ? 'Get Paid' : 'Collect & Certificate'}
                            </h3>
                            <p className="text-secondary-600">
                                {activeTab === 'seller'
                                    ? 'Buyer collects or you deliver. Payment is released to you instantly upon completion.'
                                    : 'Pick up your item or get it delivered. Receive a verified carbon savings certificate.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-16">
                        <Link
                            href={activeTab === 'seller' ? '/sell' : '/search'}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-xl px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center"
                        >
                            {activeTab === 'seller' ? 'Start Listing Now' : 'Browse Materials'}
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Impact Section */}
            <section className="py-20 bg-white">
                <div className="container-custom">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                            <Image
                                src="/images/how-it-works/impact.png"
                                alt="Sustainability Impact"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 to-transparent flex items-end p-8">
                                <div className="text-white">
                                    <h3 className="text-3xl font-bold mb-2">Real Impact</h3>
                                    <p className="text-primary-100">Every brick reused is one less manufactured.</p>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-secondary-900 mb-6">Why Skipped?</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold text-2xl">
                                        🌍
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-secondary-900">Carbon Certificates</h4>
                                        <p className="text-secondary-600">Get official documentation of your environmental contribution for every purchase.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-2xl">
                                        🛡️
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-secondary-900">Secure Escrow</h4>
                                        <p className="text-secondary-600">We hold the money until the buyer confirms they are happy with the goods.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold text-2xl">
                                        🏗️
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-secondary-900">Trade Verified</h4>
                                        <p className="text-secondary-600">Buy from verified trade professionals and top suppliers.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-20 bg-secondary-900 text-white">
                <div className="container-custom max-w-4xl">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
                    <div className="grid gap-6">
                        <div className="bg-secondary-800 p-6 rounded-xl">
                            <h4 className="font-bold text-lg mb-2">Is it free to list?</h4>
                            <p className="text-secondary-300">Yes! It is completely free to list items. We only charge a small platform fee when your item sells.</p>
                        </div>
                        <div className="bg-secondary-800 p-6 rounded-xl">
                            <h4 className="font-bold text-lg mb-2">How does delivery work?</h4>
                            <p className="text-secondary-300">Seller can offer collection, local delivery (set by mile), or nationwide courier. You choose at checkout.</p>
                        </div>
                        <div className="bg-secondary-800 p-6 rounded-xl">
                            <h4 className="font-bold text-lg mb-2">What if the item isn't as described?</h4>
                            <p className="text-secondary-300">Our Buyer Protection means we can refund you if the item is significantly different from the listing photos.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
