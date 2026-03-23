'use client';

import { useState } from 'react';
import { sendStripeReminder } from '@/app/actions/admin-stuck-sellers';

export default function StuckSellerActions({ sellerId, email, name }: { sellerId: string, email: string, name: string }) {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleRemind = async () => {
        if (!confirm(`Send a Stripe onboarding reminder email to ${name}?`)) return;
        setSending(true);
        try {
            const res = await sendStripeReminder(sellerId, email, name);
            if (res.success) {
                setSent(true);
            } else {
                alert('Failed to send: ' + res.error);
            }
        } catch (error) {
            console.error(error);
            alert('Error sending reminder');
        } finally {
            setSending(false);
        }
    };

    if (sent) return <span className="text-green-600 font-medium text-xs">Email Sent ✅</span>;

    return (
        <button
            onClick={handleRemind}
            disabled={sending}
            className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 rounded text-xs font-semibold disabled:opacity-50"
        >
            {sending ? 'Sending...' : 'Send Reminder Email'}
        </button>
    );
}
