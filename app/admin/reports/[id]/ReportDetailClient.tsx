
'use client';

import { useTransition } from 'react';
import Link from 'next/link';

export default function ReportDetailClient({ report, resolveAction }: { report: any, resolveAction: any }) {
    const [isPending, startTransition] = useTransition();

    const listing = report.listing;
    const reporter = report.reporter;

    const handleAction = (actionType: string) => {
        if (!confirm('Are you sure you want to perform this action?')) return;

        startTransition(async () => {
            const formData = new FormData();
            formData.append('action', actionType);
            await resolveAction(formData);
        });
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/reports" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
                    ← Back to Reports
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Report details</h1>
                        <p className="text-slate-600 mt-1">
                            Status: <span className={`font-semibold capitalize ${report.status === 'pending' ? 'text-orange-600' : 'text-green-600'}`}>
                                {report.status}
                            </span>
                        </p>
                    </div>
                    {report.status === 'pending' ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAction('dismiss')}
                                disabled={isPending}
                                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
                            >
                                Dismiss Report
                            </button>
                            <button
                                onClick={() => handleAction('archive_listing')}
                                disabled={isPending}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                            >
                                Remove Listing
                            </button>
                        </div>
                    ) : (
                        <div className="bg-slate-100 px-4 py-2 rounded-lg text-state-600 text-sm font-medium">
                            Resolved: {report.resolution?.replace('_', ' ')}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Report Info */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Report Info</h2>
                        <div className="space-y-4">
                            <div>
                                <span className="text-sm font-medium text-slate-500 block">Reason</span>
                                <span className="text-slate-900 font-medium capitalize">{report.reason.replace('_', ' ')}</span>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-500 block">Reporter</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                                        {reporter?.username?.[0] || '?'}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-900">{reporter?.username || 'Anonymous'}</div>
                                        <div className="text-xs text-slate-500">{reporter?.email}</div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-500 block">Date</span>
                                <span className="text-slate-900 text-sm">{new Date(report.created_at).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reported Content */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Reported Listing</h2>
                        {listing ? (
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                                        {listing.images?.[0]?.image_url ? (
                                            <img src={listing.images[0].image_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Img</div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{listing.title}</h3>
                                        <p className="text-emerald-600 font-mono font-bold mt-1">£{listing.price_gbp?.toFixed(2)}</p>
                                        <p className="text-sm text-slate-500 mt-2 line-clamp-2">{listing.description}</p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-4 grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-xs font-medium text-slate-500 uppercase">Seller</span>
                                        <p className="text-sm font-medium text-slate-900">{listing.seller?.username}</p>
                                    </div>
                                    <div>
                                        <span className="text-xs font-medium text-slate-500 uppercase">Listing ID</span>
                                        <p className="text-xs font-mono text-slate-600">{listing.id}</p>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 pt-4">
                                    <Link href={`/listing/${listing.id}`} target="_blank" className="text-blue-600 font-medium text-sm hover:underline">
                                        View Live Listing →
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-400 italic">
                                This listing has been deleted.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
