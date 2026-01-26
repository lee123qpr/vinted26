'use client';

import { useState } from 'react';
import { getUsersForExport } from '@/app/actions/export';
import { Profile } from '@/types';

export default function ExportUsersButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const users = await getUsersForExport();

            if (!users || users.length === 0) {
                alert('No users found to export.');
                return;
            }

            // Convert to CSV
            const headers = ['ID', 'Email', 'Full Name', 'Username', 'Joined Date', 'Total Sales', 'Total Purchases', 'Carbon Saved (kg)', 'Admin', 'Status'];
            const csvContent = [
                headers.join(','),
                ...users.map((u: Partial<Profile>) => [
                    u.id,
                    `"${u.email}"`,
                    `"${u.full_name || ''}"`,
                    `"${u.username || ''}"`,
                    u.created_at,
                    u.total_sales || 0,
                    u.total_purchases || 0,
                    u.total_carbon_saved_kg || 0,
                    u.is_admin ? 'Yes' : 'No',
                    u.account_status || 'active'
                ].join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `vinted_users_export_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (err: unknown) {
            console.error('Export failed:', err);
            alert('Failed to export users: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {loading ? 'Exporting...' : 'Export CSV'}
        </button>
    );
}
