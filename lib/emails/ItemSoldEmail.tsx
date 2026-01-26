import {
    Button,
    Heading,
    Text,
    Section,
    Hr,
} from '@react-email/components';
import React from 'react';
import EmailLayout from './components/EmailLayout';

interface ItemSoldEmailProps {
    sellerName?: string;
    itemName?: string;
    itemPrice?: string;
    buyerName?: string;
    orderId?: string;
}

export default function ItemSoldEmail({
    sellerName = 'Seller',
    itemName = 'Red Bricks (500x)',
    itemPrice = '£150.00',
    buyerName = 'John Doe',
}: ItemSoldEmailProps) {
    return (
        <EmailLayout preview={`Cha-ching! You sold ${itemName}`}>
            <Heading className="text-secondary-900 text-[24px] font-bold text-center p-0 my-[30px] mx-0">
                Great News, {sellerName}!
            </Heading>
            <Text className="text-secondary-500 text-[16px] leading-[24px]">
                You just sold <strong>{itemName}</strong> to {buyerName} for <span className="text-primary-600 font-bold">{itemPrice}</span>.
            </Text>

            <Section className="bg-secondary-100 p-[20px] rounded-lg my-[20px]">
                <Text className="m-0 text-secondary-900 font-bold text-[14px] uppercase tracking-wide">
                    Next Steps
                </Text>
                <Hr className="border-secondary-300 my-[10px]" />
                <Text className="m-0 text-secondary-600 text-[14px] mb-[8px]">
                    1. Message the buyer to arrange collection/delivery.
                </Text>
                <Text className="m-0 text-secondary-600 text-[14px]">
                    2. Mark the item as &quot;Shipped&quot; or &quot;Ready&quot; in your dashboard.
                </Text>
            </Section>

            <Section className="text-center mt-[32px]">
                <Button
                    className="bg-primary-600 rounded text-white text-[16px] font-semibold no-underline text-center px-6 py-3 block w-full max-w-[200px] mx-auto"
                    href="https://skipped.co.uk/dashboard/sales"
                >
                    View Order
                </Button>
            </Section>
        </EmailLayout>
    );
}
