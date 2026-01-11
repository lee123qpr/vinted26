
'use client';

import { getUsersForExport, getListingsForExport } from '@/app/actions/export';
import { useState } from 'react';

export default function MarketingPage() {
    const [isLoading, setIsLoading] = useState<string | null>(null);

    const downloadCSV = (data: any[], filename: string) => {
        if (!data || !data.length) return alert('No data to export');

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportUsers = async () => {
        setIsLoading('users');
        try {
            const data = await getUsersForExport();
            downloadCSV(data, `users_export_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (e) {
            alert('Failed to export users');
        } finally {
            setIsLoading(null);
        }
    };

    const handleExportListings = async () => {
        setIsLoading('listings');
        try {
            const data = await getListingsForExport();
            downloadCSV(data, `listings_export_${new Date().toISOString().split('T')[0]}.csv`);
        } catch (e) {
            alert('Failed to export listings');
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Marketing & Data</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Email Lists */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        Export User Data
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Download a CSV of all registered users, including their email addresses, names, and trade verification status.
                        Use this for email marketing (e.g. Mailchimp, Klaviyo).
                    </p>
                    <button
                        onClick={handleExportUsers}
                        disabled={!!isLoading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        {isLoading === 'users' ? 'Generating...' : 'Download User List (CSV)'}
                    </button>
                </div>

                {/* Listing Data */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        Export Listings
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Download a full record of all listings on the platform, including prices, views, and likes.
                        Useful for analyzing supply trends.
                    </p>
                    <button
                        onClick={handleExportListings}
                        disabled={!!isLoading}
                        className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 border border-slate-200"
                    >
                        {isLoading === 'listings' ? 'Generating...' : 'Download Listing Data (CSV)'}
                    </button>
                </div>
            </div>

            {/* Hint for automation */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-3">
                <svg className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <h3 className="font-bold text-blue-800 text-sm">Need automated emails?</h3>
                    <p className="text-blue-600 text-sm mt-1">
                        Currently, we are exporting raw data. To set up automated newsletters, you will need to import these CSVs into a tool like Resend, Mailchimp, or ConvertKit.
                        Integrating an API for automatic syncing is possible in the future.
                    </p>
                </div>
            </div>
        </div>
    );
}
