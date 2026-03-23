import { Resend } from 'resend';
import React from 'react';
import DynamicEmail from '@/lib/emails/DynamicEmail';
import { createClient } from '@supabase/supabase-js';

// Initialize Services
const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'Skipped Marketplace <noreply@skipped-uk.com>';

// Use Admin client for internal lookups to bypass RLS safely in background jobs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Helper to fetch a template and inject variables
 */
async function fetchAndParseTemplate(templateId: string, variables: Record<string, string | number>) {
    const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('template_id', templateId)
        .single();
    
    if (error || !data) {
        throw new Error(`Template ${templateId} not found in database`);
    }

    let parsedHtml = data.body_html;
    let parsedSubject = data.subject;

    // String Replacement for {{variables}}
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        parsedHtml = parsedHtml.replace(regex, String(value));
        parsedSubject = parsedSubject.replace(regex, String(value));
    }

    return { subject: parsedSubject, bodyHtml: parsedHtml };
}

export async function sendOrderConfirmationEmail({
    to, buyerName, itemName, totalPrice, orderId
}: {
    to: string; buyerName: string; itemName: string; totalPrice: string; orderId: string;
}) {
    if (!process.env.RESEND_API_KEY) return { success: false, error: 'No API Key' };
    try {
        const { subject, bodyHtml } = await fetchAndParseTemplate('order-confirmation', {
            buyerName, itemName, totalPrice, orderId
        });
        const data = await resend.emails.send({
            from: DEFAULT_FROM, to, subject,
            react: React.createElement(DynamicEmail, { bodyHtml }) as React.ReactElement,
        });
        if (data.error) throw new Error(data.error.message);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send OrderConfirmationEmail:', error);
        return { success: false, error };
    }
}

export async function sendItemSoldEmail({
    to, sellerName, itemName, itemPrice, buyerName, orderId
}: {
    to: string; sellerName: string; itemName: string; itemPrice: string; buyerName: string; orderId: string;
}) {
    if (!process.env.RESEND_API_KEY) return { success: false, error: 'No API Key' };
    try {
        const { subject, bodyHtml } = await fetchAndParseTemplate('item-sold', {
            sellerName, itemName, itemPrice, buyerName, orderId
        });
        const data = await resend.emails.send({
            from: DEFAULT_FROM, to, subject,
            react: React.createElement(DynamicEmail, { bodyHtml }) as React.ReactElement,
        });
        if (data.error) throw new Error(data.error.message);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send ItemSoldEmail:', error);
        return { success: false, error };
    }
}

export async function sendOrderShippedEmail({
    to, buyerName, itemName, isCollection
}: {
    to: string; buyerName: string; itemName: string; isCollection?: boolean;
}) {
    if (!process.env.RESEND_API_KEY) return { success: false, error: 'No API Key' };
    try {
        // Technically 'order-shipped' template handles both in our UI, or we can branch
        const { subject, bodyHtml } = await fetchAndParseTemplate('order-shipped', {
            buyerName, itemName
        });
        const data = await resend.emails.send({
            from: DEFAULT_FROM, to,
            subject: isCollection ? 'Update: Ready for Collection' : subject,
            react: React.createElement(DynamicEmail, { bodyHtml }) as React.ReactElement,
        });
        if (data.error) throw new Error(data.error.message);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send OrderShippedEmail:', error);
        return { success: false, error };
    }
}

export async function sendWelcomeEmail({
    to, username
}: {
    to: string; username: string;
}) {
    if (!process.env.RESEND_API_KEY) return { success: false, error: 'No API Key' };
    try {
        const { subject, bodyHtml } = await fetchAndParseTemplate('welcome', { username });
        const data = await resend.emails.send({
            from: DEFAULT_FROM, to, subject,
            react: React.createElement(DynamicEmail, { bodyHtml }) as React.ReactElement,
        });
        if (data.error) throw new Error(data.error.message);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send WelcomeEmail:', error);
        return { success: false, error };
    }
}

export async function sendDisputeEmail({
    to, userName, disputeId, message, resolutionType
}: {
    to: string; userName: string; disputeId: string; message: string;
    resolutionType?: 'full_refund' | 'partial_refund' | 'release_to_seller' | 'dismissed';
}) {
    if (!process.env.RESEND_API_KEY) return { success: false, error: 'No API Key' };
    try {
        const { subject, bodyHtml } = await fetchAndParseTemplate('dispute-update', {
            userName, disputeId, message
        });
        const finalSubject = resolutionType ? `Dispute Resolved: ${disputeId}` : subject;
        
        const data = await resend.emails.send({
            from: DEFAULT_FROM, to, subject: finalSubject,
            react: React.createElement(DynamicEmail, { bodyHtml }) as React.ReactElement,
        });
        if (data.error) throw new Error(data.error.message);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send DisputeUpdateEmail:', error);
        return { success: false, error };
    }
}
