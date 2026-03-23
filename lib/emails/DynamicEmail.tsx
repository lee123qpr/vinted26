import React from 'react';
import { Container, Section, Text } from '@react-email/components';
import EmailLayout from './components/EmailLayout';

interface DynamicEmailProps {
    preview?: string;
    headline?: string;
    bodyHtml: string;
}

export default function DynamicEmail({ preview, headline, bodyHtml }: DynamicEmailProps) {
    return (
        <EmailLayout preview={preview}>
            {headline && (
                <Text className="text-secondary-900 text-[24px] font-bold text-center mt-2 mb-6 mx-0 tracking-tight">
                    {headline}
                </Text>
            )}

            {/* Injected HTML directly from the Supabase editable template */}
            <Section 
               className="text-secondary-700 text-base leading-relaxed mb-6"
               dangerouslySetInnerHTML={{ __html: bodyHtml }} 
            />
            
        </EmailLayout>
    );
}
