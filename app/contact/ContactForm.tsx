'use client';

import { useState } from 'react';

export default function ContactForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Simple state handling for demo purposes
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="text-xl font-bold text-secondary-900 mb-2">Message Sent!</h3>
                <p className="text-secondary-600 mb-6">Thank you for contacting us. We will get back to you within 24 hours.</p>
                <button onClick={() => setSuccess(false)} className="text-primary-600 font-bold hover:underline">Send another message</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">First Name</label>
                    <input type="text" required className="input-field" placeholder="John" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">Last Name</label>
                    <input type="text" required className="input-field" placeholder="Doe" />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Email Address</label>
                <input type="email" required className="input-field" placeholder="john@example.com" />
            </div>

            <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Subject</label>
                <select className="input-field bg-white">
                    <option>General Inquiry</option>
                    <option>Support with an Order</option>
                    <option>Selling on Skipped</option>
                    <option>Partnership Interest</option>
                    <option>Report a Bug</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">Message</label>
                <textarea required rows={5} className="input-field py-3" placeholder="How can we help you?"></textarea>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-lg font-semibold flex items-center justify-center"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                    </>
                ) : 'Send Message'}
            </button>
        </form>
    );
}
