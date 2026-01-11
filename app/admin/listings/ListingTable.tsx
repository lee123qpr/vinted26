'use client';

import { useTransition, useState } from 'react';
import { archiveListing, deleteListing, bulkArchiveListings, bulkDeleteListings, bulkUpdateStatus } from '@/app/actions/admin-listings';
import Link from 'next/link';
import Image from 'next/image';

export default function ListingTable({ listings }: { listings: any[] }) {
    const [isPending, startTransition] = useTransition();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const handleArchive = (id: string) => {
        if (!confirm('Archive this listing? It will no longer be visible.')) return;
        startTransition(async () => {
            try { await archiveListing(id); } catch (e: any) { alert(e.message); }
        });
    };

    const handleDelete = (id: string) => {
        if (!confirm('PERMANENTLY DELETE this listing? This cannot be undone.')) return;
        startTransition(async () => {
            try { await deleteListing(id); } catch (e: any) { alert(e.message); }
        });
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        setSelectedIds(prev =>
            prev.length === listings.length ? [] : listings.map(l => l.id)
        );
    };

    const handleBulkArchive = () => {
        if (!confirm(`Archive ${selectedIds.length} selected listings?`)) return;
        startTransition(async () => {
            try {
                await bulkArchiveListings(selectedIds);
                setSelectedIds([]);
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    const handleBulkDelete = () => {
        if (!confirm(`PERMANENTLY DELETE ${selectedIds.length} selected listings? This cannot be undone.`)) return;
        startTransition(async () => {
            try {
                await bulkDeleteListings(selectedIds);
                setSelectedIds([]);
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    const handleBulkStatus = (status: string) => {
        if (!confirm(`Update ${selectedIds.length} listings to status: ${status}?`)) return;
        startTransition(async () => {
            try {
                await bulkUpdateStatus(selectedIds, status);
                setSelectedIds([]);
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    // Simple client-side safety check
    const checkSafety = (text: string) => {
        const issues = [];
        // Phone numbers (broad match)
        if (/\b\d{5,}\b/.test(text) || /(\d\s*){10,}/.test(text)) issues.push('Possible Phone Number');
        // Emails
        if (/\S+@\S+\.\S+/.test(text)) issues.push('Email detected');
        // Profanity (very basic example list)
        if (/(damn|hell|crap|scam)/i.test(text)) issues.push('Keywords');

        return issues.length > 0 ? issues : null;
    };

    return (
        <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-slate-900">Image</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Title</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Price</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Seller</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {listings.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                            <div className="w-12 h-12 bg-slate-200 rounded overflow-hidden border border-slate-300 relative">
                                {item.images?.[0]?.image_url ? (
                                    <img src={item.images[0].image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-xs text-slate-400">No Img</div>
                                )}
                            </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                            <a href={`/listing/${item.id}`} target="_blank" className="hover:underline hover:text-blue-600 flex flex-col">
                                <span>{item.title}</span>
                                {item.description && checkSafety(item.title + ' ' + item.description) && (
                                    <span className="flex items-center gap-1 mt-1 text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded w-fit">
                                        ⚠️ Review Content
                                    </span>
                                )}
                                <span className="text-xs text-slate-400 font-normal">Created: {new Date(item.created_at).toLocaleDateString()}</span>
                            </a>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-emerald-600">
                            £{item.price_gbp?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' :
                                item.status === 'sold' ? 'bg-blue-100 text-blue-700' :
                                    item.status === 'removed' ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-600'
                                }`}>
                                {item.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-xs">
                            <div className="flex flex-col">
                                <span className="font-semibold text-slate-700">{item.seller?.username || 'Unknown'}</span>
                                <span className="text-slate-400 font-mono text-[10px]">{item.seller_id.slice(0, 8)}...</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                                <a
                                    href={`/listing/${item.id}`}
                                    target="_blank"
                                    className="text-xs px-3 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                                >
                                    View
                                </a>
                                {item.status === 'active' && (
                                    <button
                                        onClick={() => handleArchive(item.id)}
                                        disabled={isPending}
                                        className="text-xs px-3 py-1 rounded bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 disabled:opacity-50"
                                    >
                                        Archive
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    disabled={isPending}
                                    className="text-xs px-3 py-1 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                                >
                                    Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
