import type { Metadata } from 'next';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
    title: 'Contact Us | Skipped Support',
    description: 'Get in touch with the Skipped team. We are here to help with buying, selling, and all your construction material needs.',
};

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-secondary-50 py-12">
            <div className="container-custom">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h1 className="text-4xl font-bold text-secondary-900 mb-4">Contact Us</h1>
                    <p className="text-lg text-secondary-600">
                        Have a question about buying or selling? Our team is here to help.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Main Contact Form */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-secondary-100 p-8">
                        <ContactForm />
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        {/* Quick Help */}
                        <div className="bg-white rounded-xl shadow-sm border border-secondary-100 p-6">
                            <h3 className="font-bold text-lg text-secondary-900 mb-4">Quick Help</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="/how-it-works" className="flex items-center text-secondary-600 hover:text-primary-600 group">
                                        <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center mr-3 group-hover:bg-primary-100">
                                            ❓
                                        </div>
                                        How it Works
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center text-secondary-600 hover:text-primary-600 group">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mr-3 group-hover:bg-blue-100">
                                            🚚
                                        </div>
                                        Shipping Guide
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="flex items-center text-secondary-600 hover:text-primary-600 group">
                                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mr-3 group-hover:bg-green-100">
                                            🛡️
                                        </div>
                                        Trust & Safety
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Details */}
                        <div className="bg-secondary-900 text-white rounded-xl shadow-sm p-6">
                            <h3 className="font-bold text-lg mb-4">Get in Touch</h3>
                            <div className="space-y-4 text-secondary-300">
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                    <div>
                                        <p className="font-medium text-white">Email</p>
                                        <a href="mailto:support@skipped.co.uk" className="hover:text-primary-400">support@skipped.co.uk</a>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    <div>
                                        <p className="font-medium text-white">Office</p>
                                        <p>123 Construction Way,<br />London, SW1A 1AA</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
