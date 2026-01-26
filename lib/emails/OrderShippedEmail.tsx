import {
    Button,
    Heading,
    Text,
    Section,
} from '@react-email/components';
import React from 'react';
import EmailLayout from './components/EmailLayout';

interface OrderShippedEmailProps {
    buyerName?: string;
    itemName?: string;
    isCollection?: boolean;
}

export default function OrderShippedEmail({
    buyerName = 'Lee',
    itemName = 'Reclaimed Red Bricks (Pack of 500)',
    isCollection = false
}: OrderShippedEmailProps) {
    const statusText = isCollection ? 'Ready for Collection' : 'Item Shipped';
    const statusIcon = isCollection ? '📍' : '🚚';

    // Dynamic message based on type
    const headline = isCollection ? 'Your item is ready!' : 'It\'s on the way!';
    const bodyText = isCollection
        ? 'The seller has marked your item as ready for pickup. Please check your messages for the collection address and time.'
        : 'Good news! Your item has been dispatched and is making its way to you.';

    return (
        <EmailLayout preview={`Update: ${statusText}`}>
            <Section className="text-center mb-8">
                <div className="inline-block p-4 bg-primary-50 rounded-full mb-4 border border-primary-100">
                    <Text className="text-3xl m-0">{statusIcon}</Text>
                </div>
                <Heading className="text-secondary-900 text-2xl font-bold m-0 mb-2">
                    {headline}
                </Heading>
                <Text className="text-secondary-500 m-0 text-sm">
                    {itemName}
                </Text>
            </Section>

            <Section className="bg-white border border-secondary-200 rounded-lg p-6 mb-8 shadow-sm">
                <Text className="text-secondary-600 text-base leading-relaxed m-0 text-center">
                    {bodyText}
                </Text>
            </Section>

            <Section className="text-center">
                <Button
                    className="bg-primary-600 rounded-lg text-white text-base font-semibold px-8 py-3.5 block w-full hover:bg-primary-700"
                    href="https://skipped.co.uk/dashboard/purchases"
                >
                    Track Status
                </Button>
            </Section>
        </EmailLayout>
    );
}
