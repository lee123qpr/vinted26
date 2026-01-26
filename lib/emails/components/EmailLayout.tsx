import {
    Body,
    Container,
    Head,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
    Hr
} from '@react-email/components';
import React from 'react';

interface EmailLayoutProps {
    preview?: string;
    children: React.ReactNode;
}

export const baseUrl = 'https://skipped.co.uk';

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
    return (
        <Html>
            <Tailwind
                config={{
                    theme: {
                        extend: {
                            colors: {
                                primary: {
                                    50: '#f0fdfa',
                                    100: '#ccfbf1',
                                    200: '#99f6e4',
                                    300: '#5eead4',
                                    400: '#2dd4bf',
                                    500: '#14b8a6',
                                    600: '#0d9488', // Brand Teal
                                    700: '#0f766e',
                                    900: '#134e4a',
                                },
                                secondary: {
                                    50: '#fafaf9',
                                    100: '#f5f5f4', // Warm gray bg
                                    200: '#e7e5e4',
                                    500: '#78716c',
                                    900: '#1c1917', // Main text
                                }
                            },
                        },
                    },
                }}
            >
                <Head />
                <Body className="bg-secondary-50 font-sans my-auto mx-auto px-2 py-8">
                    {preview && <Preview>{preview}</Preview>}
                    {/* Main Card Container */}
                    <Container className="border border-secondary-200 rounded-xl mx-auto max-w-[480px] bg-white text-clip shadow-md overflow-hidden">

                        {/* Header: Logo centered on white */}
                        <Section className="py-6 px-6 text-center border-b border-secondary-100">
                            <Img
                                src={`https://skipped.co.uk/logo.png`}
                                width="48"
                                height="48"
                                alt="Skipped Logo"
                                className="mx-auto block"
                            />
                            <Text className="text-secondary-900 font-bold text-xl mt-3 mb-0 tracking-tight">
                                SKIPPED
                            </Text>
                        </Section>

                        {/* Content Area */}
                        <Section className="px-8 py-6">
                            {children}
                        </Section>

                        {/* Footer */}
                        <Section className="bg-secondary-50 py-6 px-8 border-t border-secondary-100">
                            <div className="text-center mb-4">
                                <Link href="https://instagram.com/skipped_uk" className="inline-block mx-2">
                                    <Img src="https://skipped.co.uk/icons/instagram.png" alt="Instagram" width="20" height="20" className="opacity-60 hover:opacity-100" />
                                </Link>
                                <Link href="https://twitter.com/skipped_uk" className="inline-block mx-2">
                                    <Img src="https://skipped.co.uk/icons/twitter.png" alt="Twitter" width="20" height="20" className="opacity-60 hover:opacity-100" />
                                </Link>
                            </div>

                            <Text className="text-secondary-500 text-xs text-center leading-relaxed mb-4">
                                © 2026 Skipped Marketplace Ltd.<br />
                                123 Construction Ave, London, UK
                            </Text>

                            <div className="text-center">
                                <Link
                                    href="https://skipped.co.uk/settings/notifications"
                                    className="text-secondary-400 text-xs underline hover:text-secondary-600"
                                >
                                    Unsubscribe
                                </Link>
                                <span className="text-secondary-300 mx-2">|</span>
                                <Link
                                    href="https://skipped.co.uk/privacy"
                                    className="text-secondary-400 text-xs underline hover:text-secondary-600"
                                >
                                    Privacy Policy
                                </Link>
                            </div>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html >
    );
}
