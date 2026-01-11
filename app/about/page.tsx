import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About Us | Skipped - Our Mission & Story',
    description: 'Skipped is on a mission to eliminate construction waste. Learn about our team, our values, and how we are building a greener future.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative bg-secondary-900 text-white overflow-hidden py-20 md:py-32">
                <div className="absolute inset-0 opacity-20">
                    <Image
                        src="/images/about/hero.png"
                        alt="Background Pattern"
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="container-custom relative z-10 text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30 text-sm font-semibold tracking-wider uppercase mb-6 animate-fade-in-up">
                        Our Mission
                    </span>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up delay-100">
                        Building a Greener Future, <br /> One Brick at a Time.
                    </h1>
                    <p className="text-xl text-secondary-200 max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
                        We are on a mission to eliminate construction waste by connecting surplus materials with the people who need them.
                    </p>
                </div>
            </section>

            {/* The Problem Section */}
            <section className="py-20 bg-secondary-50">
                <div className="container-custom">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-secondary-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                </div>
                                <h3 className="text-6xl font-black text-red-500 mb-2">13%</h3>
                                <p className="text-xl font-bold text-secondary-900 mb-4">of materials delivered to site are never used.</p>
                                <p className="text-secondary-600">
                                    Every year, the UK construction industry generates over <strong>50 million tonnes</strong> of waste.
                                    Much of this is brand new, usable material that simply ends up in skips and landfill because it’s "surplus".
                                </p>
                            </div>
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold text-secondary-900 mb-6">The "Skipped" Problem</h2>
                            <p className="text-lg text-secondary-600 mb-6">
                                It starts with over-ordering "just in case", and ends with perfectly good bricks, timber, and insulation being thrown away.
                            </p>
                            <p className="text-lg text-secondary-600">
                                We realised that one site's waste is another site's treasure. Whether you are a large contractor with excess stock or a DIY enthusiast looking for cheap materials, the solution was simple: <strong>Contact the two.</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Solution / Values */}
            <section className="py-20">
                <div className="container-custom text-center mb-16">
                    <h2 className="text-3xl font-bold text-secondary-900 mb-4">Why We Do It</h2>
                    <p className="text-secondary-600 max-w-2xl mx-auto">Skip the skip. Join the circular economy.</p>
                </div>

                <div className="container-custom grid md:grid-cols-3 gap-8">
                    <div className="text-center p-6 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                            🌱
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 mb-3">Sustainability First</h3>
                        <p className="text-secondary-600">
                            We prioritise the planet. Every transaction on Skipped saves carbon and prevents landfill. We even certify it.
                        </p>
                    </div>
                    <div className="text-center p-6 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                            🤝
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 mb-3">Community Driven</h3>
                        <p className="text-secondary-600">
                            Construction is local. We build connections between local trades, suppliers, and homeowners.
                        </p>
                    </div>
                    <div className="text-center p-6 hover:-translate-y-2 transition-transform duration-300">
                        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                            🔓
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 mb-3">Accessible to All</h3>
                        <p className="text-secondary-600">
                            No trade account needed. We believe professional-grade materials should be available to everyone at fair prices.
                        </p>
                    </div>
                </div>
            </section>

            {/* Team / Hero Image Showcase */}
            <section className="py-20 bg-secondary-900 text-white text-center">
                <div className="container-custom">
                    <h2 className="text-3xl font-bold mb-12">Who We Are</h2>

                    <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
                        <Image
                            src="/images/about/hero.png"
                            alt="The Skipped Team & Community"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-8">
                            <p className="text-lg font-medium text-white/90">
                                "We're a team of builders, developers, and techies who got tired of seeing good materials go to waste."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-primary-600 text-white text-center">
                <div className="container-custom">
                    <h2 className="text-4xl font-bold mb-6">Ready to make a difference?</h2>
                    <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                        Join the fastest growing marketplace for reclaimed construction materials today.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/auth/signup" className="bg-white text-primary-700 font-bold py-3 px-8 rounded-lg hover:bg-secondary-100 transition shadow-lg">
                            Get Started
                        </Link>
                        <Link href="/search" className="bg-primary-700 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-800 transition shadow-lg border border-primary-500">
                            Browse Listings
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
