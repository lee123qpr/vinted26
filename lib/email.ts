import { Resend } from 'resend';
import React from 'react';
import OrderConfirmationEmail from '@/lib/emails/OrderConfirmationEmail';
import ItemSoldEmail from '@/lib/emails/ItemSoldEmail';
import OrderShippedEmail from '@/lib/emails/OrderShippedEmail';

// Safely initializes with undefined if key doesn't exist
const resend = new Resend(process.env.RESEND_API_KEY);
const DEFAULT_FROM = 'Skipped Marketplace <onboarding@resend.dev>';

export async function sendOrderConfirmationEmail({
    to,
    buyerName,
    itemName,
    totalPrice,
    orderId
}: {
    to: string;
    buyerName: string;
    itemName: string;
    totalPrice: string;
    orderId: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY missing. Skipping OrderConfirmationEmail.');
        return { success: false, error: 'No API Key' };
    }

    try {
        const data = await resend.emails.send({
            from: DEFAULT_FROM,
            to,
            subject: `Order Confirmed: ${itemName}`,
            react: React.createElement(OrderConfirmationEmail, { buyerName, itemName, totalPrice, orderId }) as React.ReactElement,
        });

        if (data.error) throw new Error(data.error.message);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send OrderConfirmationEmail:', error);
        return { success: false, error };
    }
}

export async function sendItemSoldEmail({
    to,
    sellerName,
    itemName,
    itemPrice,
    buyerName,
    orderId
}: {
    to: string;
    sellerName: string;
    itemName: string;
    itemPrice: string;
    buyerName: string;
    orderId: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY missing. Skipping ItemSoldEmail.');
        return { success: false, error: 'No API Key' };
    }

    try {
        const data = await resend.emails.send({
            from: DEFAULT_FROM,
            to,
            subject: `Cha-ching! You sold ${itemName}`,
            react: React.createElement(ItemSoldEmail, { sellerName, itemName, itemPrice, buyerName, orderId }) as React.ReactElement,
        });

        if (data.error) throw new Error(data.error.message);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send ItemSoldEmail:', error);
        return { success: false, error };
    }
}

export async function sendOrderShippedEmail({
    to,
    buyerName,
    itemName,
    isCollection
}: {
    to: string;
    buyerName: string;
    itemName: string;
    isCollection?: boolean;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY missing. Skipping OrderShippedEmail.');
        return { success: false, error: 'No API Key' };
    }

    try {
        const subject = isCollection ? 'Update: Ready for Collection' : 'Update: Item Shipped';
        const data = await resend.emails.send({
            from: DEFAULT_FROM,
            to,
            subject,
            react: React.createElement(OrderShippedEmail, { buyerName, itemName, isCollection }) as React.ReactElement,
        });

        if (data.error) throw new Error(data.error.message);
        return { success: true, data };
    } catch (error) {
        console.error('Failed to send OrderShippedEmail:', error);
        return { success: false, error };
    }
}
