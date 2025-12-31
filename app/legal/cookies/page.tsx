import React from 'react';
import Link from 'next/link';

export default function CookiesPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold text-secondary-900 mb-6">Cookie Policy</h1>
            <div className="prose prose-blue max-w-none text-secondary-700">
                <p>Last updated: {new Date().toLocaleDateString('en-GB')}</p>

                <h2>1. What are Cookies?</h2>
                <p>Cookies are small text files that are stored on your device when you visit a website. They help the website function properly and improve your experience.</p>

                <h2>2. How We Use Cookies</h2>
                <p>We use cookies for the following purposes:</p>
                <ul>
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., keeping you logged in).</li>
                    <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site to improve it.</li>
                    <li><strong>Preference Cookies:</strong> Remember your settings and preferences.</li>
                </ul>

                <h2>3. Managing Cookies</h2>
                <p>Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer. However, this may prevent you from taking full advantage of the website.</p>
            </div>
            <div className="mt-8">
                <Link href="/" className="btn-primary">Return Home</Link>
            </div>
        </div>
    );
}
