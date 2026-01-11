'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import { updateOrderStatus } from '@/app/actions/orders';

import ConfirmModal from '@/components/ConfirmModal';
import ReviewModal from '@/components/ReviewModal';

interface Props {
    initialSales: any[];
}

export default function SalesClient({ initialSales }: Props) {
    const [sales] = useState<any[]>(initialSales);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        orderId: string | null;
        status: 'shipped' | 'cancelled' | null;
    }>({ isOpen: false, orderId: null, status: null });

    const initiateStatusUpdate = (orderId: string, status: 'shipped' | 'cancelled') => {
        setConfirmModal({ isOpen: true, orderId, status });
    };

    const openReviewModal = (sale: any) => {
        setSelectedOrder(sale);
        setReviewModalOpen(true);
    };

    const handleConfirmUpdate = async () => {
        const { orderId, status } = confirmModal;
        if (!orderId || !status) return;

        setLoadingMap(prev => ({ ...prev, [orderId]: true }));
        try {
            const result = await updateOrderStatus(orderId, status);
            if (result.error) alert(result.error);
            else {
                setConfirmModal({ isOpen: false, orderId: null, status: null });
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setLoadingMap(prev => ({ ...prev, [orderId]: false }));
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    };

    const isProcessing = confirmModal.orderId ? loadingMap[confirmModal.orderId] : false;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-secondary-900">Sold Items</h1>

            {!sales || sales.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-secondary-200 border-dashed">
                    <div className="w-16 h-16 bg-secondary-50 text-secondary-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9a2 2 0 10-4 0v5a2 2 0 01-2 2h6m-6-4h4m8 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-secondary-900">No sales yet</h3>
                    <p className="text-secondary-500">Items you sell will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-secondary-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary-50 text-secondary-600 font-medium border-b border-secondary-100">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Buyer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {sales.map((sale: any) => (
                                    <tr key={sale.id} className="hover:bg-primary-50/10 transition">
                                        <td className="px-6 py-4 font-medium text-secondary-900">{sale.listings?.title}</td>
                                        <td className="px-6 py-4 text-secondary-700 font-bold">{sale.buyer?.username}</td>
                                        <td className="px-6 py-4 text-secondary-500 text-sm">
                                            {format(new Date(sale.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-secondary-900">{formatCurrency(sale.total_price_gbp)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`px-2 py-1 text-xs rounded-full capitalize w-fit ${sale.order_status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
                                                    sale.order_status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                        sale.order_status === 'disputed' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                            'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                    }`}>
                                                    {sale.order_status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {sale.order_status === 'pending' && (
                                                <button
                                                    onClick={() => initiateStatusUpdate(sale.id, 'shipped')}
                                                    disabled={loadingMap[sale.id]}
                                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                                                >
                                                    Mark Shipped
                                                </button>
                                            )}
                                            {sale.order_status === 'shipped' && (
                                                <span className="text-xs text-secondary-400 italic">Waiting for buyer</span>
                                            )}
                                            {sale.order_status === 'completed' && (
                                                <button
                                                    onClick={() => openReviewModal(sale)}
                                                    className="text-xs bg-secondary-50 text-secondary-600 px-3 py-1.5 rounded-md border border-secondary-200 hover:bg-secondary-100 transition"
                                                >
                                                    Review Buyer
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={handleConfirmUpdate}
                title={confirmModal.status === 'shipped' ? 'Mark as Shipped?' : 'Cancel Order?'}
                message={confirmModal.status === 'shipped'
                    ? "Are you sure you have shipped this item? Tracking details (if any) should be sent via messages."
                    : "Are you sure you want to cancel this order? This cannot be undone."}
                confirmText={confirmModal.status === 'shipped' ? 'Yes, Mark Shipped' : 'Yes, Cancel Order'}
                variant={confirmModal.status === 'cancelled' ? 'danger' : 'primary'}
                loading={isProcessing}
            />

            {selectedOrder && (
                <ReviewModal
                    isOpen={reviewModalOpen}
                    onClose={() => setReviewModalOpen(false)}
                    transactionId={selectedOrder.id}
                    revieweeId={selectedOrder.buyer_id}
                    listingTitle={selectedOrder.listings?.title}
                />
            )}
        </div>
    );
}
