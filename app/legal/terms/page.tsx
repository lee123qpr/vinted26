import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold text-secondary-900 mb-6">Terms of Service</h1>
            <div className="prose prose-blue max-w-none text-secondary-700">
                <p>Last updated: {new Date().toLocaleDateString('en-GB')}</p>

                <h2>1. Introduction</h2>
                <p>Welcome to Skipped. These Terms of Service govern your use of our website and services. By accessing or using Skipped, you agree to be bound by these terms.</p>

                <h2>2. Using Skipped</h2>
                <p>You must be at least 18 years old to use our services. You are responsible for maintaining the confidentiality of your account and password.</p>

                <h2>3. Buying and Selling</h2>
                <p>Skipped acts as a marketplace to connect buyers and sellers of construction materials. We are not a party to the transactions directly between users.</p>
                <ul>
                    <li><strong>Sellers</strong> must ensure items are accurately described and legally available for sale.</li>
                    <li><strong>Buyers</strong> must pay for items promptly and communicate effectively for collection or delivery.</li>
                </ul>

                <h2>4. Fees and Payments</h2>
                <p>We charge a platform fee on successful transactions. All fees are clearly displayed before you commit to a purchase or sale.</p>

                <h2>5. Content</h2>
                <p>You retain ownership of content you post (e.g., listing photos), but you grant us a license to use, display, and distribute it in connection with the service.</p>

                <h2>6. Termination</h2>
                <p>We reserve the right to suspend or terminate accounts that violate these terms or engage in illegal or fraudulent activity.</p>

                <h2>7. Liability</h2>
                <p>To the extent permitted by law, Skipped is not liable for indirect, incidental, or consequential damages arising from your use of the service.</p>

                <h2>8. Contact</h2>
                <p>If you have questions about these terms, please contact us at <a href="mailto:support@skipped.co.uk">support@skipped.co.uk</a>.</p>
            </div>
            <div className="mt-8">
                <Link href="/" className="btn-primary">Return Home</Link>
            </div>
        </div>
    );
}
