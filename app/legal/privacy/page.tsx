import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold text-secondary-900 mb-6">Privacy Policy</h1>
            <div className="prose prose-blue max-w-none text-secondary-700">
                <p>Last updated: {new Date().toLocaleDateString('en-GB')}</p>

                <h2>1. Introduction</h2>
                <p>Welcome to Skipped. Use of our website is subject to this Privacy Policy. Skipped ("we", "us", or "our") is committed to protecting your privacy and personal data in compliance with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.</p>

                <h2>2. Data Controller</h2>
                <p>Skipped Ltd is the data controller responsible for your personal data. <br />
                    Registered Address: [Your Registered Business Address] <br />
                    Contact Email: <a href="mailto:privacy@skipped.co.uk">privacy@skipped.co.uk</a></p>

                <h2>3. Information We Collect</h2>
                <p>We may collect and process the following data about you:</p>
                <ul>
                    <li><strong>Identity Data:</strong> Name, username, or similar identifier.</li>
                    <li><strong>Contact Data:</strong> Billing address, delivery address, email address, and telephone numbers.</li>
                    <li><strong>Transaction Data:</strong> Details about payments to and from you and other details of products you have purchased from us.</li>
                    <li><strong>Technical Data:</strong> Internet Protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                    <li><strong>Profile Data:</strong> Your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li>
                </ul>

                <h2>4. How We Use Your Personal Data</h2>
                <p>We will only use your personal data when the law allows us to. Most commonly, we use your personal data in the following circumstances:</p>
                <ul>
                    <li>Where we need to perform the contract we are about to enter into or have entered into with you (e.g., facilitating a sale).</li>
                    <li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li>
                    <li>Where we need to comply with a legal or regulatory obligation.</li>
                </ul>

                <h2>5. Disclosures of Your Personal Data</h2>
                <p>We may share your personal data with:</p>
                <ul>
                    <li><strong>Service Providers:</strong> IT and system administration services, payment processors (e.g., Stripe).</li>
                    <li><strong>Professional Advisers:</strong> Lawyers, bankers, auditors, and insurers.</li>
                    <li><strong>HM Revenue & Customs, regulators, and other authorities.</strong></li>
                </ul>
                <p>We require all third parties to respect the security of your personal data and to treat it in accordance with the law.</p>

                <h2>6. Data Security</h2>
                <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed.</p>

                <h2>7. Your Legal Rights</h2>
                <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
                <ul>
                    <li>Request access to your personal data (commonly known as a "data subject access request").</li>
                    <li>Request correction of the personal data that we hold about you.</li>
                    <li>Request erasure of your personal data.</li>
                    <li>Object to processing of your personal data.</li>
                    <li>Request restriction of processing your personal data.</li>
                    <li>Request transfer of your personal data.</li>
                    <li>Withdraw consent at any time where we are relying on consent to process your personal data.</li>
                </ul>
                <p>If you wish to exercise any of the rights set out above, please contact us at <a href="mailto:privacy@skipped.co.uk">privacy@skipped.co.uk</a>.</p>

                <h2>8. Cookies</h2>
                <p>You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. For more information about the cookies we use, please see our <Link href="/legal/cookies">Cookie Policy</Link>.</p>
            </div>
            <div className="mt-8">
                <Link href="/" className="btn-primary">Return Home</Link>
            </div>
        </div>
    );
}
