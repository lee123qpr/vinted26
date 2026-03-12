'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function HowItWorksClient() {
    const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('seller');

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Minimal Modern Hero Section */}
            <div className="relative bg-secondary-900 overflow-hidden pt-24 pb-32">
                {/* Subtle Grid Background Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />
                
                {/* Soft Radial Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-500/20 blur-[100px] pointer-events-none rounded-full" />

                <div className="container-custom relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-sm font-semibold tracking-wide border border-white/20 mb-6">
                        Simple, Secure, Sustainable
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight max-w-4xl mx-auto">
                        How Skipped Works
                    </h1>
                    <p className="text-xl md:text-2xl text-secondary-300 max-w-2xl mx-auto mb-12 font-medium">
                        The professional way to buy and sell surplus construction materials.
                    </p>

                    {/* Refined Toggle Switch */}
                    <div className="inline-flex bg-secondary-800/80 p-1.5 rounded-full backdrop-blur-md border border-secondary-700 shadow-xl">
                        <button
                            onClick={() => setActiveTab('seller')}
                            className={`px-8 py-3 rounded-full text-base font-bold transition-all duration-300 ${activeTab === 'seller' ? 'bg-primary-500 text-white shadow-md' : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
                                }`}
                        >
                            I want to sell
                        </button>
                        <button
                            onClick={() => setActiveTab('buyer')}
                            className={`px-8 py-3 rounded-full text-base font-bold transition-all duration-300 ${activeTab === 'buyer' ? 'bg-primary-500 text-white shadow-md' : 'text-secondary-400 hover:text-white hover:bg-secondary-700/50'
                                }`}
                        >
                            I want to buy
                        </button>
                    </div>
                </div>
            </div>

            {/* Premium Workflow Steps Section */}
            <section className="py-24 -mt-10 relative z-20">
                <div className="container-custom">
                    
                    <div className="grid md:grid-cols-3 gap-8 relative max-w-5xl mx-auto">
                        
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-[120px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-primary-200 to-transparent z-0" />

                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl shadow-primary-900/5 border border-secondary-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 relative">
                                {/* Number Badge */}
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                                    1
                                </div>
                                {/* Icon */}
                                <div className="text-primary-600">
                                    {activeTab === 'seller' ? (
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    ) : (
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3 tracking-tight">
                                {activeTab === 'seller' ? 'List in Seconds' : 'Find Materials'}
                            </h3>
                            <p className="text-secondary-600 leading-relaxed px-4">
                                {activeTab === 'seller'
                                    ? 'Snap a photo, add a description, and set your price. It’s completely free to list.'
                                    : 'Search for bricks, timber, or insulation near you. Filter by location and exact price.'}
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl shadow-primary-900/5 border border-secondary-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 relative delay-100">
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                                    2
                                </div>
                                <div className="text-primary-600">
                                    {activeTab === 'seller' ? (
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    ) : (
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    )}
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3 tracking-tight">
                                {activeTab === 'seller' ? 'Make a Deal' : 'Secure Purchase'}
                            </h3>
                            <p className="text-secondary-600 leading-relaxed px-4">
                                {activeTab === 'seller'
                                    ? 'Chat securely with local buyers to agree on a price, or accept instant purchases.'
                                    : 'Make an offer or buy instantly. Your money is held in safe escrow until completion.'}
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="w-24 h-24 bg-white rounded-2xl shadow-xl shadow-primary-900/5 border border-secondary-100 flex items-center justify-center mb-6 group-hover:-translate-y-2 transition-transform duration-300 relative delay-200">
                                <div className="absolute -top-3 -right-3 w-8 h-8 bg-secondary-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-2 border-white">
                                    3
                                </div>
                                <div className="text-primary-600">
                                     <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-secondary-900 mb-3 tracking-tight">
                                {activeTab === 'seller' ? 'Get Paid Safely' : 'Collect & Validate'}
                            </h3>
                            <p className="text-secondary-600 leading-relaxed px-4">
                                {activeTab === 'seller'
                                    ? 'Buyer collects or you deliver. The escrow payment is released directly to your bank account.'
                                    : 'Pick up your materials. Once confirmed, we issue your verified carbon savings certificate.'}
                            </p>
                        </div>
                    </div>

                    <div className="text-center mt-20">
                        <Link
                            href={activeTab === 'seller' ? '/sell' : '/search'}
                            className="bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 transition-all inline-flex items-center"
                        >
                            {activeTab === 'seller' ? 'Start Listing Now' : 'Browse Materials'}
                            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Why Skipped Section - Icon Grid Layout */}
            <section className="py-24 bg-white border-y border-secondary-100">
                <div className="container-custom max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-secondary-900 mb-4 tracking-tight">Why Choose Skipped?</h2>
                        <p className="text-secondary-600 text-lg">Built for the trade, designed for sustainability.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Feature 1 */}
                        <div className="bg-slate-50 border border-secondary-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h4 className="font-bold text-xl text-secondary-900 mb-3">Carbon Certification</h4>
                            <p className="text-secondary-600 leading-relaxed text-sm">Every completed transaction generates an official sustainability certificate detailing your diverted landfill waste and carbon savings.</p>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-slate-50 border border-secondary-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <h4 className="font-bold text-xl text-secondary-900 mb-3">Escrow Protection</h4>
                            <p className="text-secondary-600 leading-relaxed text-sm">Your money is entirely safe. We hold funds securely via Stripe Escrow until the buyer confirms they are completely satisfied with the goods.</p>
                        </div>

                        {/* Feature 3 */}
                        <div className="bg-slate-50 border border-secondary-100 rounded-2xl p-8 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <h4 className="font-bold text-xl text-secondary-900 mb-3">Trade Verified</h4>
                            <p className="text-secondary-600 leading-relaxed text-sm">Join a network of verified builders, merchants, and DIY enthusiasts. Transparent ratings ensure you always buy from reputable sellers.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white">
                <div className="container-custom max-w-3xl">
                    <h2 className="text-3xl font-bold text-center text-secondary-900 mb-12 tracking-tight">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        <div className="bg-slate-50 border border-secondary-100 p-6 rounded-xl">
                            <h4 className="font-bold text-secondary-900 text-lg mb-2">Is it free to list?</h4>
                            <p className="text-secondary-600">Yes! Creating listings is completely 100% free. We only charge a small 5% platform fee deducted securely from the payout when your item actually sells.</p>
                        </div>
                        <div className="bg-slate-50 border border-secondary-100 p-6 rounded-xl">
                            <h4 className="font-bold text-secondary-900 text-lg mb-2">How does delivery work?</h4>
                            <p className="text-secondary-600">Sellers can offer collection, local delivery (charged per mile), or nationwide courier dispatch. Buyers simply select their preferred option securely at the checkout.</p>
                        </div>
                        <div className="bg-slate-50 border border-secondary-100 p-6 rounded-xl">
                            <h4 className="font-bold text-secondary-900 text-lg mb-2">What if the item isn&apos;t as described?</h4>
                            <p className="text-secondary-600">Our Buyer Protection means we can immediately halt the escrow payout and refund you fully if the condition of the material is significantly different from the listing photos.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
