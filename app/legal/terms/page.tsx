import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="container-custom py-12">
            <h1 className="text-3xl font-bold text-secondary-900 mb-6">Terms of Service</h1>
            <div className="prose prose-blue max-w-none text-secondary-700">
                <p>Last updated: {new Date().toLocaleDateString('en-GB')}</p>

                <h2>1. Introduction</h2>
                <p>Welcome to Skipped. By using our website (www.skipped.co.uk) and services, you agree to comply with and be bound by the following terms and conditions of use, which together with our <Link href="/legal/privacy">Privacy Policy</Link> and <Link href="/legal/cookies">Cookie Policy</Link> govern Skipped Ltd's relationship with you in relation to this website.</p>

                <h2>2. Marketplace Nature</h2>
                <p>Skipped is a platform that connects buyers and sellers of construction materials. We are not a party to any transaction between buyers and sellers, nor do we take possession of any items listed. We do not transfer legal ownership of items from the seller to the buyer.</p>

                <h2>3. User Accounts</h2>
                <p>To use certain features of the website, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>

                <h2>4. Listing and Selling</h2>
                <p>Sellers must accurately describe items and disclose any defects. By listing an item, you represent that you have the right to sell the item and that it does not violate any laws or regulations (including health and safety standards for construction materials).</p>
                <p>We prohibit the sale of stolen goods, hazardous materials not permitted for resale, and counterfeit items.</p>

                <h2>5. Buying and Payments</h2>
                <p>Buyers agree to pay for items purchased, plus any applicable delivery or service fees. All payments are processed securely through our third-party payment provider.</p>

                <h2>6. Fees</h2>
                <p>Skipped charges a service fee for each transaction, which is retained from the sale proceeds. Specific fee structures are outlined on our fees page and presented at the time of listing/sale.</p>

                <h2>7. Limitation of Liability</h2>
                <p>Nothing in these terms shall limit or exclude our liability for fraudulent misrepresentation, or for death or personal injury resulting from our negligence.</p>
                <p>Subject to the above, Skipped Ltd shall not be liable for any indirect, special, or consequential losses, including loss of profit or business, arising out of or in connection with the use of our service.</p>

                <h2>8. Dispute Resolution</h2>
                <p>If a dispute arises between a buyer and a seller, we encourage you to resolve it amicably. Skipped offers a dispute resolution service to assist, but we are not obligated to resolve all disputes.</p>

                <h2>9. Governing Law</h2>
                <p>These terms and conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes relating to these terms shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>

                <h2>10. Contact Us</h2>
                <p>For any questions regarding these Terms, please contact us at <a href="mailto:support@skipped.co.uk">support@skipped.co.uk</a>.</p>
            </div>
            <div className="mt-8">
                <Link href="/" className="btn-primary">Return Home</Link>
            </div>
        </div>
    );
}
