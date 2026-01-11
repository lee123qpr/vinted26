'use client';

import { useState } from 'react';

const faqs = [
    {
        question: "Is it safe to buy from other users?",
        answer: "Yes! We use a secure escrow payment system. This means your money is held safely by us and only released to the seller once you've received your item and are happy with it."
    },
    {
        question: "How do I arrange delivery?",
        answer: "You can choose between collection or delivery when buying. For delivery, sellers set their own shipping options. We recommend messaging the seller before purchase to agree on the best method for large items."
    },
    {
        question: "What if the item isn't as described?",
        answer: "You're covered by our Buyer Protection. If an item arrives damaged or significantly different from the description, you can report it within 48 hours for a full refund."
    },
    {
        question: "Are there any fees for selling?",
        answer: "Listing items is completely free! We only charge a small platform fee when your item sells. There are no hidden costs or monthly subscriptions."
    },
    {
        question: "How do the carbon certificates work?",
        answer: "Every time you buy second-hand materials instead of new ones, you save carbon emissions. We calculate this saving and issue you a verified certificate that you can download and share."
    }
];

export default function HomeFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20 bg-white border-t border-secondary-100">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-secondary-900 mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-secondary-600">
                        Got questions? We've got answers.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="border border-secondary-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-primary-300 bg-white"
                        >
                            <button
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none bg-white"
                                onClick={() => toggleFAQ(index)}
                            >
                                <span className="text-lg font-semibold text-secondary-900">{faq.question}</span>
                                <span className={`ml-6 flex-shrink-0 transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''}`}>
                                    <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>

                            <div
                                className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-secondary-600 leading-relaxed border-t border-secondary-50 bg-secondary-50/30">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
