import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { formatCurrency } from '@/lib/format';

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ orderId: string }> }) {
    const { orderId } = await searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!orderId || !user) {
        redirect('/dashboard/orders');
    }

    const { data: order, error } = await supabase
        .from('transactions')
        .select(`
            *,
            listings:listing_id (title, images, seller_id),
            seller:seller_id (username)
        `)
        .eq('id', orderId)
        .eq('buyer_id', user.id)
        .single();

    if (error || !order) {
        // Fallback if order not found immediately (e.g. latency) or permission denied
        return (
            <div className="min-h-screen bg-secondary-50 pt-24 px-4">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Payment Successful!</h1>
                    <p className="text-secondary-600 mb-6">
                        Your payment was processed securely. We are retrieving your order details.
                    </p>
                    <Link href="/dashboard/orders" className="btn-primary w-full block">
                        View My Orders
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-50 pt-24 pb-12 px-4">
            <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-secondary-100">
                <div className="bg-green-600 p-8 text-center text-white">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
                    <p className="text-green-100">Thank you for your purchase.</p>
                </div>

                <div className="p-8">
                    <div className="space-y-6">

                        {/* Order Details */}
                        <div className="bg-secondary-50 rounded-lg p-4 flex gap-4">
                            {order.listings.images && order.listings.images[0] && (
                                <div className="w-16 h-16 rounded-md overflow-hidden relative flex-shrink-0">
                                    <img
                                        src={order.listings.images[0].url || order.listings.images[0].image_url}
                                        alt={order.listings.title}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            )}
                            <div>
                                <h3 className="font-semibold text-secondary-900 line-clamp-1">{order.listings.title}</h3>
                                <p className="text-sm text-secondary-500">Sold by {order.seller?.username}</p>
                                <p className="text-green-600 font-bold mt-1">{formatCurrency(order.total_price_gbp)}</p>
                            </div>
                        </div>

                        {/* Next Steps */}
                        <div className="border-t border-secondary-100 pt-6">
                            <h3 className="font-semibold text-secondary-900 mb-3">What happens next?</h3>
                            <ul className="space-y-3 text-secondary-600 text-sm">
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">1</span>
                                    <span>The seller will be notified to arrange {order.delivery_method === 'collection' ? 'collection' : 'delivery'}.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">2</span>
                                    <span>Your payment is held in safe escrow until you confirm receipt.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">3</span>
                                    <span>You can track status and chat with the seller in your orders page.</span>
                                </li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-4">
                            <Link href="/dashboard/orders" className="btn-primary w-full text-center py-3">
                                View Order & Chat
                            </Link>
                            <Link href="/" className="text-secondary-500 hover:text-secondary-900 text-center text-sm py-2">
                                Return to Marketplace
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
