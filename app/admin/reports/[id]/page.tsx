
import { createAdminClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import ReportDetailClient from './ReportDetailClient';

export const dynamic = 'force-dynamic';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createAdminClient();
    const { id } = await params;

    // Fetch report with listing details
    const { data: report, error } = await supabase
        .from('reports')
        .select(`
            *,
            listing:listings(
                id,
                title,
                description,
                price_gbp,
                condition,
                created_at,
                seller_id,
                images:listing_images(image_url),
                seller:profiles!seller_id(id, username, email, avatar_url)
            ),
            reporter:profiles!reporter_id(id, username, email)
        `)
        .eq('id', id)
        .single();

    if (error || !report) {
        notFound();
    }

    // Server Action to Resolve Report
    async function resolveReport(formData: FormData) {
        'use server';
        const action = formData.get('action');
        const adminNotes = formData.get('admin_notes');
        const supabase = await createAdminClient();

        if (action === 'dismiss') {
            await supabase.from('reports').update({ status: 'resolved', resolution: 'dismissed' }).eq('id', id);
        } else if (action === 'archive_listing') {
            // 1. Archive Listing
            await supabase.from('listings').update({ status: 'removed' }).eq('id', report.listing_id);
            // 2. Mark Report Resolved
            await supabase.from('reports').update({ status: 'resolved', resolution: 'listing_removed' }).eq('id', id);
        }

        redirect('/admin/reports');
    }

    return (
        <ReportDetailClient report={report} resolveAction={resolveReport} />
    );
}
