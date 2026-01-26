import { createClient, createAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';
import Image from 'next/image';

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    // Use Admin Client to ensure we can fetch all details (buyer/seller profiles) regardless of strict RLS
    const adminSupabase = await createAdminClient();

    const { data: transaction } = await adminSupabase
        .from('transactions')
        .select(`
            *,
            listings:listings!listing_id (
                title, 
                description,
                carbon_saved_kg, 
                weight_kg,
                listing_images (image_url)
            ),
            buyer:profiles!buyer_id (username, full_name),
            seller:profiles!seller_id (username, full_name)
        `)
        .eq('id', id)
        .single();

    if (!transaction) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-secondary-200">
                    <h1 className="text-xl font-bold text-secondary-900 mb-2">Certificate Not Found</h1>
                    <Link href="/dashboard/orders" className="text-primary-600 hover:underline">Return to Orders</Link>
                </div>
            </div>
        );
    }

    const listing = transaction.listings;
    const carbonSaved = listing?.carbon_saved_kg || 0;
    const wasteDiverted = listing?.weight_kg || 0;
    const listingImage = listing?.listing_images?.[0]?.image_url;

    // 1. Validation: No Certificate if no impact data
    if (carbonSaved <= 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-secondary-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border-t-8 border-secondary-300">
                    <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-6 text-secondary-400">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-secondary-900 mb-3">No Certificate Available</h2>
                    <p className="text-secondary-600 mb-8 leading-relaxed">
                        This transaction does not have associated carbon saving data (e.g. implementation prior to impact tracking or non-applicable category), so a certificate cannot be generated.
                    </p>
                    <Link href="/dashboard/orders" className="btn-primary w-full block py-3">Return to Orders</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-100 py-12 px-4 print:bg-white print:p-0">
            {/* Certificate Container */}
            <div className="max-w-3xl mx-auto bg-white border-[20px] border-double border-green-50 p-12 relative shadow-2xl text-center print:shadow-none print:border-green-100 print:w-full print:max-w-none">

                {/* Background Watermark/Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #059669 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-6 left-6 w-24 h-24 border-t-4 border-l-4 border-green-700 opacity-80 decoration-corner"></div>
                <div className="absolute bottom-6 right-6 w-24 h-24 border-b-4 border-r-4 border-green-700 opacity-80 decoration-corner"></div>
                <div className="absolute top-6 right-6 w-24 h-24 border-t-4 border-r-4 border-green-700 opacity-80 decoration-corner"></div>
                <div className="absolute bottom-6 left-6 w-24 h-24 border-b-4 border-l-4 border-green-700 opacity-80 decoration-corner"></div>

                {/* Header Section */}
                <div className="relative mb-10">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-800 rounded-lg flex items-center justify-center shadow-lg print:shadow-none">
                                <span className="text-white font-bold text-2xl">S</span>
                            </div>
                            <span className="text-3xl font-black tracking-tight text-secondary-900">Skipped.</span>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-green-900 tracking-wider uppercase mb-2 drop-shadow-sm">
                        Certificate <span className="text-green-700">of</span> Impact
                    </h1>
                    <div className="h-1 w-32 bg-green-600 mx-auto rounded-full mb-4"></div>

                    <p className="text-xs text-secondary-400 font-mono tracking-widest uppercase">
                        Transaction Verification Code
                    </p>
                    <p className="font-mono font-bold text-secondary-600 text-sm">{transaction.id}</p>
                </div>

                {/* Main Content */}
                <div className="relative z-10 mb-12">
                    <p className="text-xl text-secondary-600 font-medium mb-8">This document certifies that</p>

                    {/* Buyer Name */}
                    <h2 className="text-3xl font-serif font-bold text-secondary-900 mb-8 pb-4 border-b border-secondary-100 inline-block px-12">
                        {transaction.buyer?.full_name || transaction.buyer?.username || user.email}
                    </h2>

                    <p className="text-xl text-secondary-600 font-medium mb-6">
                        has made a verified sustainable contribution by purchasing
                    </p>

                    {/* Listing Card */}
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 bg-green-50/50 p-6 rounded-2xl hover:bg-green-50 transition-colors border border-green-100 max-w-xl mx-auto mb-8">
                        {listingImage && (
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                                <img src={listingImage} alt="Listing" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-secondary-900 leading-tight mb-1">{listing.title}</h3>
                            <p className="text-sm text-secondary-500 italic line-clamp-2">"{listing.description?.substring(0, 80)}..."</p>
                            <div className="mt-2 text-xs font-semibold text-green-700 uppercase tracking-wide">
                                Sold by {transaction.seller?.full_name || transaction.seller?.username || 'Verified Seller'}
                            </div>
                        </div>
                    </div>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-2 gap-8 mb-8 max-w-2xl mx-auto">
                        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 shadow-sm">
                            <span className="block text-5xl font-black text-green-600 mb-2">{carbonSaved.toFixed(2)}<span className="text-2xl text-green-400 ml-1">kg</span></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-green-800 border-t border-green-200 pt-2 block w-full">CO₂e Avoided</span>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-100 shadow-sm">
                            <span className="block text-5xl font-black text-green-600 mb-2">{wasteDiverted.toFixed(2)}<span className="text-2xl text-green-400 ml-1">kg</span></span>
                            <span className="text-xs font-bold uppercase tracking-widest text-green-800 border-t border-green-200 pt-2 block w-full">Waste Diverted</span>
                        </div>
                    </div>

                    {/* Calculation Methodology */}
                    <div className="bg-secondary-50 rounded-lg p-3 text-left max-w-2xl mx-auto border border-secondary-100">
                        <p className="text-[10px] text-secondary-500 leading-tight">
                            <span className="font-bold text-secondary-700">Methodology:</span> Impact calculated based on the material weight ({listing.weight_kg}kg) multiplied by standard industry Embodied Carbon Factors (ICE Database V3) for this material category. Diverted waste assumes 100% displacement of new material production.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t-2 border-secondary-100 pt-8 flex flex-col md:flex-row justify-between items-end gap-8 relative z-10">
                    <div className="text-left">
                        <p className="text-xs text-secondary-400 uppercase tracking-widest mb-1 font-bold">Verified Date</p>
                        <p className="font-serif text-xl text-secondary-900 font-bold">{new Date(transaction.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="text-center">
                        <div className="text-green-800 font-bold text-sm tracking-wide mb-1 uppercase">Skipped Mission</div>
                        <p className="text-xs text-secondary-500 max-w-[200px] mx-auto">Building the circular economy for the construction industry, one brick at a time.</p>
                    </div>

                    <div className="text-right">
                        <div className="h-12 relative mb-2 flex justify-end">
                            {/* Signature */}
                            <svg className="w-32 h-12 text-primary-800" viewBox="0 0 150 50" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 40c10-20 40-10 50-30s20 20 40 10c10-5 20 10 30 0" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <p className="text-[10px] text-secondary-400 uppercase tracking-widest font-bold">Authorized Digital Signature</p>
                        <p className="text-xs font-bold text-primary-700">Skipped Verification Bot</p>
                    </div>
                </div>

            </div>

            {/* Action Buttons */}
            <div className="text-center mt-12 space-x-4 print:hidden">
                <PrintButton />
                <Link href="/dashboard/orders" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 transition-colors">
                    Back to Orders
                </Link>
            </div>
        </div>
    );
}
