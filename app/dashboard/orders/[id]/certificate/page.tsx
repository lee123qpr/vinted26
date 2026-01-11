import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const { data: transaction } = await supabase
        .from('transactions')
        .select(`
            *,
            listings:listing_id (
                title, 
                carbon_saved_kg, 
                weight_kg,
                listing_images (image_url)
            )
        `)
        .eq('id', id)
        .single();

    if (!transaction) {
        return <div className="p-8 text-center text-red-500">Certificate not found.</div>;
    }

    const listing = transaction.listings;
    const carbonSaved = listing?.carbon_saved_kg || 0;
    const wasteDiverted = listing?.weight_kg || 0;

    return (
        <div className="min-h-screen bg-secondary-50 py-12 px-4">
            <div className="max-w-2xl mx-auto bg-white border-4 border-double border-green-200 p-12 relative shadow-xl text-center">

                {/* Decorative Elements */}
                <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-green-600"></div>
                <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-green-600"></div>

                {/* Header */}
                <div className="mb-8">
                    <div className="inline-block p-4 bg-green-50 rounded-full text-green-600 mb-4">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-green-900 tracking-wider uppercase mb-2">Certificate of Impact</h1>
                    <p className="text-secondary-500 italic">Presented to</p>
                    <p className="text-xl font-bold text-secondary-900 mt-1">{user.email}</p>
                </div>

                {/* Content */}
                <div className="space-y-6 mb-12">
                    <p className="text-lg text-secondary-700">
                        In recognition of your sustainable choice to purchase <span className="font-bold text-secondary-900">"{listing.title}"</span> on Vinted26.
                    </p>

                    <div className="grid grid-cols-2 gap-8 my-8">
                        <div className="bg-green-50/50 p-6 rounded-lg">
                            <span className="block text-4xl font-bold text-green-600 mb-1">{carbonSaved.toFixed(2)}kg</span>
                            <span className="text-sm font-semibold uppercase tracking-wide text-green-800">CO₂ Emissions Prevented</span>
                        </div>
                        <div className="bg-green-50/50 p-6 rounded-lg">
                            <span className="block text-4xl font-bold text-green-600 mb-1">{wasteDiverted.toFixed(2)}kg</span>
                            <span className="text-sm font-semibold uppercase tracking-wide text-green-800">Waste Diverted from Landfill</span>
                        </div>
                    </div>

                    <p className="text-sm text-secondary-500">
                        This verified transaction contributes to a more circular economy and a healthier planet.
                    </p>
                </div>

                {/* Footer */}
                <div className="border-t border-secondary-100 pt-8 flex justify-between items-end">
                    <div className="text-left">
                        <p className="text-xs text-secondary-400 uppercase tracking-wider mb-1">Date</p>
                        <p className="font-serif text-secondary-900">{new Date(transaction.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <div className="h-10 w-32 relative mb-1">
                            {/* Signature Mock */}
                            <span className="font-cursive text-2xl text-green-800 font-bold">Vinted26</span>
                        </div>
                        <p className="text-xs text-secondary-400 uppercase tracking-wider">Authorized Signature</p>
                    </div>
                </div>

            </div>

            <div className="text-center mt-8 space-x-4">
                <PrintButton />
                <Link href="/dashboard/orders" className="text-secondary-600 font-medium hover:text-secondary-900">
                    Back to Orders
                </Link>
            </div>
        </div>
    );
}
