import {
    Button,
    Heading,
    Text,
    Section,
} from '@react-email/components';
import React from 'react';
import EmailLayout from './components/EmailLayout';

interface AdminWarningEmailProps {
    username?: string;
    warningMessage?: string;
}

export default function AdminWarningEmail({
    username = 'Lee',
    warningMessage = 'Your listing "Hazardous Waste" violates our prohibited items policy and has been removed.'
}: AdminWarningEmailProps) {
    return (
        <EmailLayout preview="Action Required: Account Warning">
            <Section className="text-center mb-6">
                <div className="inline-block p-3 bg-red-50 rounded-full mb-4 border border-red-100">
                    <Text className="text-2xl m-0 text-red-600">⚠️</Text>
                </div>
                <Heading className="text-red-700 text-2xl font-bold m-0">
                    Account Warning
                </Heading>
            </Section>

            <Text className="text-secondary-600 text-base mb-6">
                Hi {username},
            </Text>

            <Text className="text-secondary-600 text-base mb-6">
                We&apos;re contacting you regarding your account activity on Skipped.
            </Text>

            <Section className="bg-red-50 border border-red-100 rounded-lg p-6 mb-8 text-center">
                <Text className="m-0 text-red-900 font-medium">
                    {warningMessage}
                </Text>
            </Section>

            <Text className="text-secondary-500 text-sm mb-8 text-center">
                Please review our proper usage guidelines. Further violations may result in account suspension.
            </Text>

            <Section className="text-center">
                <Button
                    className="bg-white border-2 border-red-600 text-red-600 rounded-lg text-base font-bold px-8 py-3 block w-full hover:bg-red-50"
                    href="https://skipped.co.uk/terms"
                >
                    Review Terms of Service
                </Button>
            </Section>
        </EmailLayout>
    );
}
