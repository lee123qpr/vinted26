import { Metadata } from 'next';
import HowItWorksClient from './HowItWorksClient';

export const metadata: Metadata = {
    title: 'How It Works | Skipped - Buy & Sell Construction Materials',
    description: 'Learn how Skipped makes it easy to buy and sell surplus construction materials. List in seconds, buy securely, and save money while reducing waste.',
};

export default function HowItWorksPage() {
    return <HowItWorksClient />;
}
