'use server';

import { Resend } from 'resend';
import WelcomeEmail from '@/lib/emails/WelcomeEmail';
import ItemSoldEmail from '@/lib/emails/ItemSoldEmail';
import OrderConfirmationEmail from '@/lib/emails/OrderConfirmationEmail';
import OrderShippedEmail from '@/lib/emails/OrderShippedEmail';
import ResetPasswordEmail from '@/lib/emails/ResetPasswordEmail';
import NewListingsEmail from '@/lib/emails/NewListingsEmail';
import AdminWarningEmail from '@/lib/emails/AdminWarningEmail';

// Initialize Resend with API Key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

const templates = {
    'welcome': <WelcomeEmail />,
    'item-sold': <ItemSoldEmail />,
    'order-confirmation': <OrderConfirmationEmail />,
    'order-shipped': <OrderShippedEmail />,
    'reset-password': <ResetPasswordEmail />,
    'new-listings': <NewListingsEmail />,
    'admin-warning': <AdminWarningEmail />,
};

type TemplateKey = keyof typeof templates;

export async function sendTestEmail(templateKey: string, toEmail: string) {
    // 1. Validate Input
    if (!toEmail || !templateKey) {
        return { success: false, error: 'Missing email or template' };
    }

    // 2. Validate API Key
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is missing. Email sending skipped.');
        return {
            success: false,
            error: 'Configuration Error: RESEND_API_KEY is missing in .env file. Unable to send email.'
        };
    }

    // 3. Get Template
    const component = templates[templateKey as TemplateKey];
    if (!component) {
        return { success: false, error: 'Invalid template selected' };
    }

    try {
        // 4. Send Email via Resend
        const data = await resend.emails.send({
            from: 'Skipped Marketplace <onboarding@resend.dev>', // Default Resend test domain
            to: toEmail,
            subject: `[TEST] ${templateKey.replace('-', ' ').toUpperCase()}`,
            react: component,
        });

        if (data.error) {
            console.error('Resend API Error:', data.error);
            return { success: false, error: data.error.message };
        }

        return { success: true, data };

    } catch (error) {
        console.error('Email Send Exception:', error);
        return { success: false, error: 'Failed to send email. Check server logs.' };
    }
}

// New: Render template to HTML string for Admin Preview
import { render } from '@react-email/components';

export async function renderTemplate(templateKey: string) {
    const component = templates[templateKey as TemplateKey];
    if (!component) return '';

    try {
        const html = await render(component);
        return html;
    } catch (e) {
        console.error('Render Error:', e);
        return '<div>Error rendering template</div>';
    }
}
