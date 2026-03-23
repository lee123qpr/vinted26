'use client';

import { useState } from 'react';
import { dismissMessageFlag, suspendUser } from '@/app/actions/admin-trust';

export default function TrustActions({ messageId, senderId }: { messageId: string, senderId: string }) {
    const [loading, setLoading] = useState(false);

    const handleDismiss = async () => {
        setLoading(true);
        try {
            await dismissMessageFlag(messageId);
        } finally {
            setLoading(false);
        }
    };

    const handleSuspend = async () => {
        if (!confirm('Are you sure you want to suspend this user? This will instantly remove their active listings and block them from logging in.')) return;
        setLoading(true);
        try {
            await suspendUser(senderId);
            // After suspending, we still want to dismiss the flag from the queue
            await dismissMessageFlag(messageId);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-end gap-2">
            <button
                onClick={handleDismiss}
                disabled={loading}
                className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
                Dismiss
            </button>
            <button
                onClick={handleSuspend}
                disabled={loading}
                className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 rounded text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
            >
                Suspend User
            </button>
        </div>
    );
}
