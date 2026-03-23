'use server';

import { sendTestEmail } from '@/app/actions/email-debug';
import { createAdminClient } from '@/lib/supabase/server';

export async function sendStripeReminder(sellerId: string, email: string, name: string) {
    if (!email) return { success: false, error: 'No email found for this user.' };

    try {
        const supabase = await createAdminClient();
        
        // Technically we are using the generic `admin-warning` template and injecting a custom message 
        // into the body using the `email_templates` DB. But since our generic setup replaces variables in the DB template...
        // Wait, the `admin-warning` template doesn't have custom message injection natively in DB, 
        // but we can just use `sendTestEmail` conceptually for now which parses the raw HTML.
        // Actually, let's write a targeted Stripe notification function or use Resend directly using the "admin-warning" DB template.

        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .eq('template_id', 'admin-warning')
            .single();

        if (error || !data) return { success: false, error: 'Action required template missing' };

        const overrideSubject = `Action Required: Connect your Bank Account to receive Payouts`;
        const overrideHtml = `
            <h2>Action Required, ${name}</h2>
            <p>We noticed you have a linked Stripe Account, but you haven't finished Identity Verification!</p>
            <p><strong>Your payouts from sales are currently suspended.</strong></p>
            <p>Please log in, go to your Account Settings, and click "Connect Bank" to finish setting up your account so we can release your funds.</p>
        `;

        // Load the generic email layout
        const React = await import('react');
        const { default: DynamicEmail } = await import('@/lib/emails/DynamicEmail');
        const { Resend } = await import('resend');

        const resend = new Resend(process.env.RESEND_API_KEY);
        const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'Skipped Marketplace <noreply@skipped-uk.com>';

        const component = React.createElement(DynamicEmail, { bodyHtml: overrideHtml }) as React.ReactElement;

        const sentData = await resend.emails.send({
            from: DEFAULT_FROM,
            to: email,
            subject: overrideSubject,
            react: component,
        });

        if (sentData.error) throw new Error(sentData.error.message);
        return { success: true };

    } catch (e: any) {
        console.error('Failed to send Stripe reminder:', e);
        return { success: false, error: e.message };
    }
}
