'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import { updateOrderStatus } from '@/app/actions/orders';
import Link from 'next/link';
import toast from 'react-hot-toast';

import ConfirmModal from '@/components/ConfirmModal';
import ReviewModal from '@/components/ReviewModal';

interface Props {
    initialSales: any[];
}

export default function SalesClient({ initialSales: sales }: Props) {
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
            if (result.error) toast.error(result.error);
            else {
                toast.success('Order status updated!');
                setConfirmModal({ isOpen: false, orderId: null, status: null });
            }
        } catch (err) {
            toast.error('Failed to update status');
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
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-secondary-900 mb-2">No sales yet</h3>
                    <p className="text-secondary-500 mb-8 max-w-sm mx-auto">You haven't sold any items yet. List your surplus materials to make money and help the environment.</p>
                    <Link href="/sell" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-bold rounded-lg text-white bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        List an Item
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-secondary-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary-50 text-secondary-600 border-b border-secondary-100">
                                <tr>
                                    <th className="px-6 py-4 w-[40%] text-xs font-semibold uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-4 w-[15%] text-xs font-semibold uppercase tracking-wider">Buyer</th>
                                    <th className="px-6 py-4 w-[12%] text-xs font-semibold uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 w-[10%] text-xs font-semibold uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-4 w-[10%] text-xs font-semibold uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 w-[13%] text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {sales.map((sale: any) => (
                                    <tr key={sale.id} className="hover:bg-primary-50/10 transition">
                                        <td className="px-6 py-4">
                                            <Link href={`/listing/${sale.listings?.id}`} className="flex items-center space-x-4 group">
                                                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-secondary-200 bg-secondary-50 flex-shrink-0 group-hover:border-primary-300 transition-colors">
                                                    {sale.listings?.listing_images?.[0]?.image_url ? (
                                                        <img
                                                            src={sale.listings.listing_images[0].image_url}
                                                            alt={sale.listings.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-secondary-300">
                                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-sm font-medium text-secondary-900 group-hover:text-primary-600 transition-colors">{sale.listings?.title}</span>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-secondary-600">{sale.buyer?.username}</td>
                                        <td className="px-6 py-4 text-sm font-medium text-secondary-900">
                                            {format(new Date(sale.created_at), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-secondary-900">{formatCurrency(sale.total_price_gbp)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize w-fit ${sale.order_status === 'completed' ? 'bg-green-100 text-green-700 border border-green-200' :
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
                                            {sale.order_status === 'completed' && !sale.reviews?.length && (
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
