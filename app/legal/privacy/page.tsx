import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold text-secondary-900 mb-6">Privacy Policy</h1>
            <div className="prose prose-blue max-w-none text-secondary-700">
                <p>Last updated: {new Date().toLocaleDateString('en-GB')}</p>

                <h2>1. Information We Collect</h2>
                <p>We collect information you provide directly to us, such as when you create an account, list an item, or communicate with other users. This includes your name, email, address, and transaction details.</p>

                <h2>2. How We Use Your Information</h2>
                <p>We use your information to:</p>
                <ul>
                    <li>Provide, maintain, and improve our services.</li>
                    <li>Process transactions and send related information.</li>
                    <li>Verify your identity and prevent fraud.</li>
                    <li>Communicate with you about products, services, and promotions.</li>
                </ul>

                <h2>3. Sharing of Information</h2>
                <p>We do not sell your personal data. We differ information only as follows:</p>
                <ul>
                    <li>With other users (e.g., sharing delivery details with a seller/buyer).</li>
                    <li>With service providers (e.g., payment processors like Stripe).</li>
                    <li>In response to a legal request if required by law.</li>
                </ul>

                <h2>4. Data Security</h2>
                <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>

                <h2>5. Your Rights</h2>
                <p>You have the right to access, correct, or delete your personal information. You can manage most settings directly in your account dashboard.</p>
            </div>
            <div className="mt-8">
                <Link href="/" className="btn-primary">Return Home</Link>
            </div>
        </div>
    );
}
