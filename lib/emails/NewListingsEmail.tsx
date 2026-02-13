import {
    Button,
    Heading,
    Text,
    Section,
    Row,
    Column,
    Img,
} from '@react-email/components';
import React from 'react';
import EmailLayout from './components/EmailLayout';

interface Listing {
    id: string;
    title: string;
    price: string;
    image: string;
}

interface NewListingsEmailProps {
    username?: string;
    listings?: Listing[];
}

export default function NewListingsEmail({
    username = 'Users',
    listings = [
        { id: '1', title: 'Reclaimed Oak Beams', price: '£250', image: 'https://placehold.co/150' },
        { id: '2', title: 'Pack of 500 Bricks', price: '£150', image: 'https://placehold.co/150' },
        { id: '3', title: 'Velux Window (New)', price: '£120', image: 'https://placehold.co/150' },
    ]
}: NewListingsEmailProps) {
    return (
        <EmailLayout preview="Fresh materials found for you">
            <Section className="text-center mb-6">
                <Text className="text-2xl m-0 mb-2">🔎</Text>
                <Heading className="text-secondary-900 text-2xl font-bold m-0">
                    Fresh Finds This Week
                </Heading>
                <Text className="text-secondary-500 m-0 text-sm mt-2">
                    Hand-picked for you, {username}
                </Text>
            </Section>

            <Section className="bg-white rounded-lg mb-8">
                {listings.map((item, index) => (
                    <Row key={item.id} className={`mb-4 pb-4 ${index !== listings.length - 1 ? 'border-b border-secondary-100' : ''}`}>
                        <Column className="w-20 align-top">
                            <Img
                                src={item.image}
                                width="80"
                                height="80"
                                className="rounded-lg object-cover bg-secondary-100"
                                alt={item.title}
                            />
                        </Column>
                        <Column className="pl-4 align-top">
                            <Text className="m-0 font-bold text-base text-secondary-900 leading-tight mb-1">
                                {item.title}
                            </Text>
                            <Text className="m-0 text-primary-600 font-bold text-sm mb-2">
                                {item.price}
                            </Text>
                            <Button
                                className="text-xs font-semibold text-secondary-500 bg-secondary-100 px-3 py-1.5 rounded hover:bg-secondary-200 no-underline"
                                href={`https://www.skipped-uk.com/listing/${item.id}`}
                            >
                                View Details
                            </Button>
                        </Column>
                    </Row>
                ))}
            </Section>

            <Section className="text-center">
                <Button
                    className="bg-secondary-900 rounded-lg text-white text-base font-semibold px-8 py-3.5 block w-full hover:bg-black"
                    href="https://www.skipped-uk.com/search"
                >
                    Browse All New Items
                </Button>
            </Section>
        </EmailLayout>
    );
}
