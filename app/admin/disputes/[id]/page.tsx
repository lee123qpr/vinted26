import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import DisputeDetailClient from './DisputeDetailClient';

export const dynamic = 'force-dynamic';

export default async function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createAdminClient();
    const { id } = await params;

    // Fetch dispute with related data
    const { data: dispute, error } = await supabase
        .from('disputes')
        .select(`
            *,
            transaction:transactions(
                id,
                buyer_id,
                seller_id,
                total_amount_gbp,
                platform_fee_gbp,
                payment_status,
                buyer:profiles!buyer_id(id, username, email, avatar_url),
                seller:profiles!seller_id(id, username, email, avatar_url),
                listing:listings(id, title, price_gbp)
            )
        `)
        .eq('id', id)
        .single();

    if (error || !dispute) {
        notFound();
    }

    // Fetch dispute messages
    const { data: messages } = await supabase
        .from('dispute_messages')
        .select('*, sender:profiles(username, avatar_url)')
        .eq('dispute_id', id)
        .order('created_at', { ascending: true });

    // Fetch dispute evidence
    const { data: evidence } = await supabase
        .from('dispute_evidence')
        .select('*, uploader:profiles!uploaded_by(username)')
        .eq('dispute_id', id)
        .order('created_at', { ascending: false });

    return (
        <DisputeDetailClient
            dispute={dispute}
            messages={messages || []}
            evidence={evidence || []}
        />
    );
}
