import React from 'react';
import Link from 'next/link';

export default function CookiesPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold text-secondary-900 mb-6">Cookie Policy</h1>
            <div className="prose prose-blue max-w-none text-secondary-700">
                <p>Last updated: {new Date().toLocaleDateString('en-GB')}</p>
                <p>This Cookie Policy explains how Skipped Ltd ("we", "us", or "our") uses cookies and similar technologies. It should be read alongside our <Link href="/legal/privacy">Privacy Policy</Link>.</p>

                <h2>1. What are Cookies?</h2>
                <p>Cookies are small text files mainly used to identify a user and maintain session details. They are stored on your device when you visit a website.</p>

                <h2>2. Types of Cookies We Use</h2>
                <p>We use the following categories of cookies:</p>

                <h3>Strictly Necessary Cookies</h3>
                <p>These are essential for the operation of our website. They include, for example, cookies that enable you to log into secure areas of our website, use a shopping cart, or make use of e-billing services. You cannot opt-out of these cookies as the website cannot function without them.</p>

                <h3>Analytical/Performance Cookies</h3>
                <p>These allow us to recognise and count the number of visitors and to see how visitors move around our website when they are using it. This helps us to improve the way our website works, for example, by ensuring that users are finding what they are looking for easily. We use tools like Google Analytics for this purpose.</p>

                <h3>Functionality Cookies</h3>
                <p>These are used to recognise you when you return to our website. This enables us to personalise our content for you, greet you by name, and remember your preferences (for example, your choice of language or region).</p>

                <h2>3. Consent and Control</h2>
                <p>In accordance with the Privacy and Electronic Communications Regulations (PECR), we require your consent for any cookies that are not "strictly necessary" for the provision of our service.</p>
                <p>When you first visit our site, you will see a cookie banner allowing you to accept or decline non-essential cookies. You can change your preferences at any time by clearing your browser cookies for this domain, which will re-trigger the consent banner.</p>

                <h2>4. Contact</h2>
                <p>If you have any questions about our use of cookies, please email us at <a href="mailto:privacy@skipped.co.uk">privacy@skipped.co.uk</a>.</p>
            </div>
            <div className="mt-8">
                <Link href="/" className="btn-primary">Return Home</Link>
            </div>
        </div>
    );
}
