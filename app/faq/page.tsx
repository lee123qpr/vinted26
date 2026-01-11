import type { Metadata } from 'next';
import FaqClient from './FaqClient';

export const metadata: Metadata = {
    title: 'FAQ | Skipped - Frequently Asked Questions',
    description: 'Find answers to common questions about buying and selling construction materials on Skipped.',
};

export default function FaqPage() {
    return <FaqClient />;
}
