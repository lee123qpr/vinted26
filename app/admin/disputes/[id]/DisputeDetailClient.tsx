'use client';

import { useState, useTransition } from 'react';
import { sendDisputeMessage, resolveDispute } from '@/app/actions/admin-disputes';
import Link from 'next/link';

export default function DisputeDetailClient({ dispute, messages, evidence }: any) {
    const [isPending, startTransition] = useTransition();
    const [messageText, setMessageText] = useState('');
    const [showResolveForm, setShowResolveForm] = useState(false);
    const [resolutionType, setResolutionType] = useState<string>('');
    const [refundAmount, setRefundAmount] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    const transaction = dispute.transaction;
    const buyer = transaction?.buyer;
    const seller = transaction?.seller;
    const listing = transaction?.listing;

    const handleSendMessage = (recipientId: string) => {
        if (!messageText.trim()) return;

        startTransition(async () => {
            try {
                await sendDisputeMessage(dispute.id, messageText, recipientId);
                setMessageText('');
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    const handleResolve = () => {
        if (!resolutionType) {
            alert('Please select a resolution type');
            return;
        }

        if ((resolutionType === 'partial_refund') && !refundAmount) {
            alert('Please enter refund amount');
            return;
        }

        const amount = resolutionType === 'full_refund'
            ? transaction.total_amount_gbp
            : resolutionType === 'partial_refund'
                ? parseFloat(refundAmount)
                : undefined;

        startTransition(async () => {
            try {
                await resolveDispute(dispute.id, resolutionType as any, amount, adminNotes);
                setShowResolveForm(false);
                alert('Dispute resolved successfully');
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Link href="/admin/disputes" className="text-blue-600 hover:underline text-sm mb-2 inline-block">
                    ← Back to Disputes
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Dispute #{dispute.id.slice(0, 8)}</h1>
                <p className="text-slate-600 mt-1">
                    Status: <span className={`font-semibold ${dispute.status === 'open' ? 'text-orange-600' : 'text-green-600'}`}>
                        {dispute.status}
                    </span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Dispute Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Dispute Details</h2>

                        <div className="space-y-3">
                            <div>
                                <span className="text-sm font-medium text-slate-600">Reason:</span>
                                <p className="text-slate-900">{dispute.reason}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600">Description:</span>
                                <p className="text-slate-900">{dispute.description}</p>
                            </div>
                            <div>
                                <span className="text-sm font-medium text-slate-600">Opened:</span>
                                <p className="text-slate-900">{new Date(dispute.created_at).toLocaleString()}</p>
                            </div>
                            {listing && (
                                <div>
                                    <span className="text-sm font-medium text-slate-600">Listing:</span>
                                    <Link href={`/listing/${listing.id}`} target="_blank" className="text-blue-600 hover:underline ml-2">
                                        {listing.title} (£{listing.price_gbp})
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Messages</h2>

                        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                            {messages.map((msg: any) => (
                                <div key={msg.id} className={`p-3 rounded-lg ${msg.is_admin ? 'bg-blue-50 border border-blue-200' : 'bg-slate-50'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm">
                                            {msg.is_admin ? '🛡️ Admin' : msg.sender?.username || 'User'}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(msg.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-slate-900 text-sm">{msg.message_text}</p>
                                </div>
                            ))}
                        </div>

                        {dispute.status === 'open' && (
                            <div className="border-t border-slate-200 pt-4">
                                <textarea
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                    placeholder="Type your message to both parties..."
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                />
                                <button
                                    onClick={() => handleSendMessage(buyer?.id || seller?.id)}
                                    disabled={isPending || !messageText.trim()}
                                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Send Message
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Evidence */}
                    {evidence.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Evidence</h2>
                            <div className="grid grid-cols-2 gap-4">
                                {evidence.map((item: any) => (
                                    <div key={item.id} className="border border-slate-200 rounded-lg p-3">
                                        <a href={item.evidence_url} target="_blank" className="text-blue-600 hover:underline text-sm">
                                            {item.evidence_type === 'image' ? '🖼️' : '📄'} View Evidence
                                        </a>
                                        <p className="text-xs text-slate-500 mt-1">
                                            By: {item.uploader?.username}
                                        </p>
                                        {item.description && (
                                            <p className="text-xs text-slate-600 mt-1">{item.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Parties */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Parties</h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs font-medium text-slate-600 mb-1">Buyer</p>
                                <div className="flex items-center gap-2">
                                    {buyer?.avatar_url && (
                                        <img src={buyer.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                                    )}
                                    <div>
                                        <p className="font-medium text-slate-900">{buyer?.username}</p>
                                        <p className="text-xs text-slate-500">{buyer?.email}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4">
                                <p className="text-xs font-medium text-slate-600 mb-1">Seller</p>
                                <div className="flex items-center gap-2">
                                    {seller?.avatar_url && (
                                        <img src={seller.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                                    )}
                                    <div>
                                        <p className="font-medium text-slate-900">{seller?.username}</p>
                                        <p className="text-xs text-slate-500">{seller?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transaction Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4">Transaction</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Amount:</span>
                                <span className="font-semibold">£{transaction?.total_amount_gbp?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Platform Fee:</span>
                                <span>£{transaction?.platform_fee_gbp?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Payment Status:</span>
                                <span className="capitalize">{transaction?.payment_status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Resolution Actions */}
                    {dispute.status === 'open' && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Resolve Dispute</h2>

                            {!showResolveForm ? (
                                <button
                                    onClick={() => setShowResolveForm(true)}
                                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                                >
                                    Resolve Dispute
                                </button>
                            ) : (
                                <div className="space-y-3">
                                    <select
                                        value={resolutionType}
                                        onChange={(e) => setResolutionType(e.target.value)}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                    >
                                        <option value="">Select Resolution</option>
                                        <option value="full_refund">Full Refund to Buyer</option>
                                        <option value="partial_refund">Partial Refund</option>
                                        <option value="release_to_seller">Release to Seller</option>
                                        <option value="dismissed">Dismiss Dispute</option>
                                    </select>

                                    {resolutionType === 'partial_refund' && (
                                        <input
                                            type="number"
                                            value={refundAmount}
                                            onChange={(e) => setRefundAmount(e.target.value)}
                                            placeholder="Refund amount (£)"
                                            step="0.01"
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                        />
                                    )}

                                    <textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Admin notes (optional)"
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm"
                                        rows={3}
                                    />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleResolve}
                                            disabled={isPending}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Confirm Resolution
                                        </button>
                                        <button
                                            onClick={() => setShowResolveForm(false)}
                                            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {dispute.status === 'resolved' && dispute.resolution_type && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-green-800 mb-2">✓ Resolved</h2>
                            <p className="text-sm text-green-700">
                                Resolution: <span className="font-semibold capitalize">{dispute.resolution_type.replace('_', ' ')}</span>
                            </p>
                            {dispute.refund_amount_gbp && (
                                <p className="text-sm text-green-700 mt-1">
                                    Amount: £{dispute.refund_amount_gbp.toFixed(2)}
                                </p>
                            )}
                            {dispute.admin_notes && (
                                <p className="text-sm text-green-700 mt-2 border-t border-green-200 pt-2">
                                    Notes: {dispute.admin_notes}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
