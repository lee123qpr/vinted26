import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About Us | Skipped - Our Mission & Story',
    description: 'Skipped is on a mission to eliminate construction waste. Learn about our team, our values, and how we are building a greener future.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Minimal Modern Hero Section */}
            <section className="relative bg-secondary-900 overflow-hidden py-24 md:py-32">
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
                    <span className="inline-block py-1 px-3 rounded-full bg-white/10 text-white text-sm font-semibold tracking-wide border border-white/20 mb-6 animate-fade-in-up">
                        Our Mission
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight max-w-4xl mx-auto animate-fade-in-up delay-100">
                        Building a Greener Future, <br /> One Brick at a Time.
                    </h1>
                    <p className="text-xl md:text-2xl text-secondary-300 max-w-3xl mx-auto font-medium animate-fade-in-up delay-200">
                        We are on a mission to completely eliminate construction waste by connecting surplus high-quality materials directly with the people who need them.
                    </p>
                </div>
            </section>

            {/* The Problem Section */}
            <section className="py-24 bg-white border-b border-secondary-100 relative z-20 -mt-8 rounded-t-[3rem]">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center gap-16 max-w-5xl mx-auto">
                        <div className="md:w-1/2">
                            <div className="bg-slate-50 p-10 rounded-3xl shadow-xl shadow-secondary-200/50 border border-secondary-100 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-500">
                                <div className="absolute -top-6 -right-6 text-secondary-100 group-hover:text-primary-50 transition-colors duration-500">
                                    <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 20 20"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </div>
                                <div className="relative z-10">
                                    <h3 className="text-7xl font-black text-red-500 mb-4 tracking-tighter">13<span className="text-5xl">%</span></h3>
                                    <p className="text-2xl font-bold text-secondary-900 mb-6 leading-tight">of materials delivered to site are never used.</p>
                                    <p className="text-secondary-600 leading-relaxed text-lg">
                                        Every year, the UK construction industry generates over <strong className="text-secondary-900">50 million tonnes</strong> of waste. 
                                        Much of this is brand new, usable material that simply ends up in skips and landfill because it’s "surplus".
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <span className="text-primary-600 font-bold uppercase tracking-wider text-sm mb-2 block">The Challenge</span>
                            <h2 className="text-4xl font-bold text-secondary-900 mb-6 tracking-tight">The "Skipped" Problem</h2>
                            <p className="text-xl text-secondary-600 mb-6 leading-relaxed">
                                It starts with over-ordering "just in case", and ends with perfectly good bricks, timber, and insulation being thrown away.
                            </p>
                            <div className="w-12 h-1 bg-primary-500 mb-6 rounded-full"></div>
                            <p className="text-lg text-secondary-600 leading-relaxed">
                                We realised that one site's waste is another site's treasure. Whether you are a large contractor with excess stock or a DIY enthusiast looking for professional-grade materials without the retail markup, the solution was simple: <strong>Connect the two.</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Solution / Values */}
            <section className="py-24 bg-slate-50">
                <div className="container-custom max-w-5xl">
                    <div className="text-center mb-16">
                        <span className="text-primary-600 font-bold uppercase tracking-wider text-sm mb-2 block">Our Core Values</span>
                        <h2 className="text-4xl font-bold text-secondary-900 mb-4 tracking-tight">Why We Do It</h2>
                        <p className="text-secondary-600 text-xl max-w-2xl mx-auto">Skip the skip. Join the circular economy.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-10">
                        {/* Value 1 */}
                        <div className="bg-white border border-secondary-100 rounded-3xl p-10 hover:shadow-xl hover:shadow-primary-900/5 hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mb-8">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-secondary-900 mb-4 tracking-tight">Sustainability First</h3>
                            <p className="text-secondary-600 leading-relaxed">
                                We prioritise the planet. Every transaction on Skipped saves carbon and prevents landfill. We even certify it for your ESG reporting.
                            </p>
                        </div>
                        
                        {/* Value 2 */}
                        <div className="bg-white border border-secondary-100 rounded-3xl p-10 hover:shadow-xl hover:shadow-primary-900/5 hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-secondary-900 mb-4 tracking-tight">Community Driven</h3>
                            <p className="text-secondary-600 leading-relaxed">
                                Construction is local. We build powerful peer-to-peer connections between local trades, national suppliers, and homeowners.
                            </p>
                        </div>
                        
                        {/* Value 3 */}
                        <div className="bg-white border border-secondary-100 rounded-3xl p-10 hover:shadow-xl hover:shadow-primary-900/5 hover:-translate-y-1 transition-all">
                            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-8">
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-secondary-900 mb-4 tracking-tight">Accessible to All</h3>
                            <p className="text-secondary-600 leading-relaxed">
                                No trade account needed. We believe professional-grade materials should be completely available to everyone at fair, transparent prices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Statement Showcase */}
            <section className="py-32 bg-secondary-900 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary-800/50 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="container-custom relative z-10 max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-10 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                        <svg className="w-10 h-10 text-primary-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.584 2.872a1 1 0 01.832 0l9 4a1 1 0 010 1.824l-9 4a1 1 0 01-.832 0l-9-4a1 1 0 010-1.824l9-4z" /><path d="M2.5 10.966l8.084 3.593a1 1 0 00.832 0l8.084-3.593-8.5-3.778-8.5 3.778zM2.5 15.966l8.084 3.593a1 1 0 00.832 0l8.084-3.593-8.5-3.778-8.5 3.778z" /></svg>
                    </div>
                    
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight leading-tight">
                        Built by the trade, <br className="hidden md:block"/> for the trade.
                    </h2>
                    
                    <div className="relative inline-block">
                        <svg className="absolute top-0 left-0 transform -translate-x-8 -translate-y-6 w-16 h-16 text-secondary-700/50" fill="currentColor" viewBox="0 0 32 32"><path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z"/></svg>
                        <p className="text-2xl md:text-3xl text-secondary-300 font-medium leading-relaxed max-w-3xl italic relative z-10">
                            "We're a team of builders, developers, and tech experts who got tired of seeing perfectly good materials go to waste."
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 bg-primary-600 text-white text-center relative overflow-hidden">
                {/* Simple geometric decorations */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(#fff 2px, transparent 2px)`, backgroundSize: `32px 32px` }}></div>
                
                <div className="container-custom relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Ready to make a difference?</h2>
                    <p className="text-primary-100 text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-medium">
                        Join the fastest growing marketplace for reclaimed construction materials today.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link href="/auth/signup" className="w-full sm:w-auto bg-white text-primary-700 font-bold text-lg py-4 px-10 rounded-xl hover:bg-secondary-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                            Get Started Free
                        </Link>
                        <Link href="/search" className="w-full sm:w-auto bg-primary-700 text-white font-bold text-lg py-4 px-10 rounded-xl hover:bg-primary-800 transition-all shadow-lg border border-primary-500 hover:border-primary-400">
                            Browse Materials
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
