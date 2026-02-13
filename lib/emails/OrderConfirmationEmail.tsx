import {
    Button,
    Heading,
    Text,
    Section,
    Hr,
    Row,
    Column,
} from '@react-email/components';
import React from 'react';
import EmailLayout from './components/EmailLayout';

interface OrderConfirmationEmailProps {
    buyerName?: string;
    itemName?: string;
    totalPrice?: string;
    orderId?: string;
}

export default function OrderConfirmationEmail({
    buyerName = 'Lee',
    itemName = 'Reclaimed Red Bricks (Pack of 500)',
    totalPrice = '£150.00',
    orderId = 'ORD-2026-8892'
}: OrderConfirmationEmailProps) {
    return (
        <EmailLayout preview={`Order Confirmed: ${itemName}`}>
            <Section className="text-center mb-6">
                <div className="inline-block p-3 bg-green-100 rounded-full mb-4">
                    <Text className="text-2xl m-0">✅</Text>
                </div>
                <Heading className="text-secondary-900 text-2xl font-bold m-0">
                    Order Confirmed
                </Heading>
                <Text className="text-secondary-500 mt-2 text-sm uppercase tracking-wider font-medium">
                    {orderId}
                </Text>
            </Section>

            <Text className="text-secondary-600 text-base text-center mb-8">
                Good news, {buyerName}! Your order has been secured. The seller has been notified and will prepare your item.
            </Text>

            {/* Receipt Card */}
            <Section className="bg-secondary-50 rounded-lg border border-secondary-200 p-4 mb-8">
                <Row className="mb-2">
                    <Column>
                        <Text className="text-secondary-500 text-sm m-0">Item</Text>
                    </Column>
                    <Column className="text-right">
                        <Text className="text-secondary-900 font-medium text-sm m-0">{itemName}</Text>
                    </Column>
                </Row>
                <Hr className="border-secondary-200 my-2" />
                <Row>
                    <Column>
                        <Text className="text-secondary-900 font-bold text-base m-0">Total</Text>
                    </Column>
                    <Column className="text-right">
                        <Text className="text-primary-600 font-bold text-lg m-0">{totalPrice}</Text>
                    </Column>
                </Row>
            </Section>

            <Section className="text-center">
                <Button
                    className="bg-secondary-900 rounded-lg text-white text-base font-semibold px-8 py-3.5 block w-full hover:bg-black"
                    href={`https://www.skipped-uk.com/dashboard/purchases`}
                >
                    View Order Details
                </Button>
            </Section>
        </EmailLayout>
    );
}
