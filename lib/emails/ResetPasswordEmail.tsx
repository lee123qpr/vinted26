import {
    Button,
    Heading,
    Text,
    Section,
} from '@react-email/components';
import React from 'react';
import EmailLayout from './components/EmailLayout';

interface ResetPasswordEmailProps {
    resetLink?: string;
}

export default function ResetPasswordEmail({ resetLink = 'https://skipped.co.uk/reset-password?token=123' }: ResetPasswordEmailProps) {
    return (
        <EmailLayout preview="Reset your Skipped password">
            <Heading className="text-secondary-900 text-[24px] font-bold text-center p-0 my-[30px] mx-0">
                Reset Password
            </Heading>
            <Text className="text-secondary-500 text-[16px] leading-[24px]">
                We received a request to reset your password for your Skipped account.
                If you didn't ask for this, you can safely ignore this email.
            </Text>
            <Section className="text-center my-[32px]">
                <Button
                    className="bg-secondary-900 rounded text-white text-[16px] font-semibold no-underline text-center px-6 py-3 block w-full max-w-[200px] mx-auto"
                    href={resetLink}
                >
                    Reset Password
                </Button>
            </Section>
            <Text className="text-secondary-400 text-[12px] text-center">
                Link expires in 1 hour.
            </Text>
        </EmailLayout>
    );
}
