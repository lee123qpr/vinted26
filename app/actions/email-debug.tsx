'use server';

import { Resend } from 'resend';
import { render } from '@react-email/components';
import React from 'react';
import DynamicEmail from '@/lib/emails/DynamicEmail';
import { createAdminClient } from '@/lib/supabase/server';

// Initialize Services
const DEFAULT_FROM = process.env.RESEND_FROM_EMAIL || 'Skipped Marketplace <noreply@skipped-uk.com>';

export async function sendTestEmail(templateKey: string, toEmail: string) {
    if (!toEmail || !templateKey) return { success: false, error: 'Missing email or template' };
    if (!process.env.RESEND_API_KEY) return { success: false, error: 'Configuration Error: API Key missing.' };

    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .eq('template_id', templateKey)
            .single();

        if (error || !data) return { success: false, error: 'Template not found' };

        // Render with generic fallback strings for testing
        let parsedHtml = data.body_html.replace(/\{\{[a-zA-Z]+\}\}/g, 'Test User');
        let subject = data.subject.replace(/\{\{[a-zA-Z]+\}\}/g, 'Test Item');

        const component = React.createElement(DynamicEmail, { bodyHtml: parsedHtml }) as React.ReactElement;

        const sentData = await resend.emails.send({
            from: DEFAULT_FROM,
            to: toEmail,
            subject: `[TEST] ${subject}`,
            react: component,
        });

        if (sentData.error) {
            console.error('Resend Error:', sentData.error);
            return { success: false, error: sentData.error.message };
        }
        
        return { success: true, data: sentData.data };

    } catch (error: any) {
        console.error('Email Send Exception:', error);
        return { success: false, error: error.message || 'Failed to send test email.' };
    }
}

export async function renderTemplate(templateKey: string) {
    try {
        const supabase = await createAdminClient();
        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .eq('template_id', templateKey)
            .single();

        if (error || !data) return '<div style="padding: 20px;">Template not found in DB</div>';

        // Render with text placeholders so it doesn't look empty
        let parsedHtml = data.body_html.replace(/\{\{[a-zA-Z]+\}\}/g, 'Test User');

        const component = React.createElement(DynamicEmail, { bodyHtml: parsedHtml }) as React.ReactElement;
        const html = await render(component);
        return html;
    } catch (e) {
        console.error('Render Error:', e);
        return '<div style="padding: 20px;">Error rendering template</div>';
    }
}

export async function getTemplateRaw(templateKey: string) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
        .from('email_templates')
        .select('subject, body_html')
        .eq('template_id', templateKey)
        .single();
    
    if (error || !data) return null;
    return { subject: data.subject, bodyHtml: data.body_html };
}

export async function saveTemplate(templateKey: string, subject: string, bodyHtml: string) {
    try {
        const supabase = await createAdminClient();
        const { error } = await supabase
            .from('email_templates')
            .upsert({ 
                template_id: templateKey,
                subject, 
                body_html: bodyHtml, 
                updated_at: new Date().toISOString() 
            }, { onConflict: 'template_id' });
        
        if (error) throw error;
        return { success: true };
    } catch (error: any) {
        console.error('Save Template Error:', error);
        return { success: false, error: error.message };
    }
}
