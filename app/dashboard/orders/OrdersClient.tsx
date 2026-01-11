'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { updateOrderStatus } from '@/app/actions/orders';
import ReviewModal from '@/components/ReviewModal';
import DisputeModal from '@/components/DisputeModal';
import ConfirmModal from '@/components/ConfirmModal';

interface Props {
    initialOrders: any[];
}

export default function OrdersClient({ initialOrders }: Props) {
    const [orders] = useState<any[]>(initialOrders);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [disputeModalOpen, setDisputeModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
    const router = useRouter();

    const openConfirmDeliveryModal = (order: any) => {
        setSelectedOrder(order);
        setConfirmModalOpen(true);
    };

    const handleConfirmDelivery = async () => {
        if (!selectedOrder) return;
        const orderId = selectedOrder.id;

        setLoadingMap(prev => ({ ...prev, [orderId]: true }));
        try {
            const result = await updateOrderStatus(orderId, 'completed');
            if (result.error) {
                alert(result.error);
            } else {
                router.refresh(); // Refresh to show "Completed" status and enable Review button
                setConfirmModalOpen(false);
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setLoadingMap(prev => ({ ...prev, [orderId]: false }));
            // Note: We don't close modal here on error to allow retry, 
            // but on success we closed it above.
            // Actually, if we want to close on error to avoid stuck state:
            if (loadingMap[orderId]) setConfirmModalOpen(false);
        }
    };

    const openReviewModal = (order: any) => {
        setSelectedOrder(order);
        setReviewModalOpen(true);
    };

    const openDisputeModal = (order: any) => {
        setSelectedOrder(order);
        setDisputeModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-secondary-900">My Orders</h1>

            {orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <p className="text-secondary-500">No orders yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-secondary-50 text-secondary-600 font-medium border-b border-secondary-200">
                                <tr>
                                    <th className="px-6 py-4">Item</th>
                                    <th className="px-6 py-4">Seller</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Next Step</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-secondary-100">
                                {orders.map((order) => {
                                    const isPending = order.order_status === 'pending' || order.order_status === 'held_in_escrow';
                                    const isShipped = order.order_status === 'shipped';
                                    const isCompleted = order.order_status === 'completed';

                                    return (
                                        <tr key={order.id} className="hover:bg-primary-50/10 transition group">
                                            <td className="px-6 py-4 font-medium text-secondary-900 group-hover:text-primary-600 transition">
                                                <Link href={`/listing/${order.listings?.id}`} className="flex items-center space-x-4">
                                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-secondary-200 bg-secondary-50 flex-shrink-0">
                                                        {order.listings?.listing_images?.[0]?.image_url ? (
                                                            <div className="relative w-full h-full">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={order.listings.listing_images[0].image_url}
                                                                    alt={order.listings.title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-secondary-300">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span>{order.listings?.title || <span className="text-red-500 italic">Unknown Item</span>}</span>
                                                    </div>
                                                </Link>
                                            </td>
                                            <td className="px-6 py-4 text-secondary-700 font-bold">{order.seller?.username || 'Unknown'}</td>
                                            <td className="px-6 py-4 text-secondary-500 text-sm">
                                                {format(new Date(order.created_at), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full capitalize ${isCompleted ? 'bg-green-100 text-green-700 border border-green-200' :
                                                        isShipped ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                            order.order_status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                                                                'bg-yellow-100 text-yellow-700 border border-yellow-200'
                                                    }`}>
                                                    {order.order_status?.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-secondary-600">
                                                {isPending && "Waiting for seller to ship"}
                                                {isShipped && <span className="text-primary-600 font-medium">Confirm delivery to release funds</span>}
                                                {isCompleted && "Complete"}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    {isCompleted && (
                                                        <>
                                                            <Link
                                                                href={`/dashboard/orders/${order.id}/certificate`}
                                                                className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-md border border-green-200 hover:bg-green-100 transition whitespace-nowrap"
                                                            >
                                                                Certificate
                                                            </Link>
                                                            <button
                                                                onClick={() => openReviewModal(order)}
                                                                className="text-xs bg-secondary-50 text-secondary-600 px-3 py-1.5 rounded-md border border-secondary-200 hover:bg-secondary-100 transition"
                                                            >
                                                                Review
                                                            </button>
                                                        </>
                                                    )}
                                                    {isShipped && (
                                                        <div className="flex flex-col gap-1 sm:flex-row">
                                                            <button
                                                                onClick={() => openConfirmDeliveryModal(order)}
                                                                disabled={loadingMap[order.id]}
                                                                className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-md hover:bg-primary-700 transition disabled:opacity-50 shadow-sm whitespace-nowrap"
                                                            >
                                                                Confirm Delivery
                                                            </button>
                                                            <button
                                                                onClick={() => openDisputeModal(order)}
                                                                className="text-xs bg-white text-red-600 px-3 py-1.5 rounded-md border border-red-200 hover:bg-red-50 transition whitespace-nowrap"
                                                            >
                                                                Report Issue
                                                            </button>
                                                        </div>
                                                    )}
                                                    {isPending && (
                                                        <span className="text-xs text-secondary-400 italic">No actions yet</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedOrder && (
                <>
                    <ReviewModal
                        isOpen={reviewModalOpen}
                        onClose={() => setReviewModalOpen(false)}
                        transactionId={selectedOrder.id}
                        revieweeId={selectedOrder.seller_id}
                        listingTitle={selectedOrder.listings?.title}
                    />
                    <DisputeModal
                        isOpen={disputeModalOpen}
                        onClose={() => setDisputeModalOpen(false)}
                        transactionId={selectedOrder.id}
                    />
                    <ConfirmModal
                        isOpen={confirmModalOpen}
                        onClose={() => setConfirmModalOpen(false)}
                        onConfirm={handleConfirmDelivery}
                        title="Confirm Delivery"
                        message={`Are you sure you have received "${selectedOrder.listings?.title}" and want to release the payment to the seller? This action cannot be undone.`}
                        confirmText="Yes, Release Funds"
                        loading={loadingMap[selectedOrder.id]}
                    />
                </>
            )}
        </div>
    );
}
