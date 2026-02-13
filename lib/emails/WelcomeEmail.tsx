import {
    Button,
    Heading,
    Text,
    Section,

} from '@react-email/components';
import React from 'react';
import EmailLayout from './components/EmailLayout';

interface WelcomeEmailProps {
    username?: string;
}

export default function WelcomeEmail({ username = 'Builder' }: WelcomeEmailProps) {
    return (
        <EmailLayout preview="Welcome to Skipped! let&apos;s get building.">
            {/* Hero Image / Illustration could go here */}

            <Heading className="text-secondary-900 text-[24px] font-bold text-center mt-2 mb-6 mx-0 tracking-tight">
                Welcome to the Crew, {username}!
            </Heading>

            <Text className="text-secondary-600 text-base mb-6 text-center">
                Thanks for joining <strong>Skipped</strong>. You&apos;re now part of a community dedicated to reducing waste and saving money on construction materials.
            </Text>

            <Section className="bg-primary-50 border border-primary-100 rounded-lg p-4 mb-8 text-center">
                <Text className="text-primary-700 text-sm font-medium m-0">
                    Your account is fully active and ready to trade.
                </Text>
            </Section>

            <Section className="text-center mb-8">
                <Button
                    className="bg-primary-600 rounded-lg text-white text-[16px] font-semibold no-underline text-center px-8 py-3.5 block w-full shadow-sm hover:bg-primary-700"
                    href="https://www.skipped-uk.com/sell"
                >
                    List Your First Item
                </Button>
            </Section>

            <Text className="text-secondary-500 text-[14px] leading-[24px] text-center">
                Looking to buy instead? <a href="https://www.skipped-uk.com/search" className="text-primary-600 font-medium hover:underline">Browse listings near you</a>.
            </Text>
        </EmailLayout>
    );
}
