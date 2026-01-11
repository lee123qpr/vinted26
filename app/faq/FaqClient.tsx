'use client';

import { useState } from 'react';
import Link from 'next/link';

type FaqCategory = 'buying' | 'selling' | 'shipping' | 'safety' | 'account';

interface FaqItem {
    question: string;
    answer: string;
    category: FaqCategory;
}

const faqs: FaqItem[] = [
    // Buying
    {
        question: "How do I make an offer?",
        answer: "Navigate to the item page and click the 'Make Offer' button. Enter your price and submit. The seller will be notified and can accept, reject, or counter your offer.",
        category: 'buying'
    },
    {
        question: "Is my payment secure?",
        answer: "Yes. We use a secure escrow system. Your payment is held safely until you confirm that you have received the item and are happy with it.",
        category: 'buying'
    },
    {
        question: "Can I inspect the item before buying?",
        answer: "We recommend asking the seller for more photos or details via chat. For collection items, you can inspect them upon pickup before releasing the final payment code.",
        category: 'buying'
    },
    // Selling
    {
        question: "How much does it list to sell?",
        answer: "Listing items on Skipped is completely free! We only charge a small platform fee (5%) when your item successfully sells.",
        category: 'selling'
    },
    {
        question: "How do I get paid?",
        answer: "Once the buyer receives the item and marks the order as complete, your funds are released to your Skipped Balance. You can withdraw this to your bank account at any time.",
        category: 'selling'
    },
    {
        question: "What items can I sell?",
        answer: "You can sell any surplus construction materials, tools, or architectural salvage. Items must be legal and safe to sell.",
        category: 'selling'
    },
    // Shipping
    {
        question: "Who pays for shipping?",
        answer: "The buyer pays for shipping at checkout. The cost is calculated based on the delivery method selected by the seller (Collection, Local Delivery, or Courier).",
        category: 'shipping'
    },
    {
        question: "Do you offer nationwide delivery?",
        answer: "It depends on the seller. Sellers can choose to offer courier delivery. Filter your search by 'Delivery Available' to find shippable items.",
        category: 'shipping'
    },
    // Safety
    {
        question: "What is Buyer Protection?",
        answer: "Buyer Protection covers you if an item doesn't arrive or is significantly different from the description. We will refund your payment.",
        category: 'safety'
    }
];

export default function FaqClient() {
    const [activeCategory, setActiveCategory] = useState<FaqCategory | 'all'>('all');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const filteredFaqs = activeCategory === 'all'
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-secondary-50 py-12 md:py-20">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-secondary-900 mb-6">Frequently Asked Questions</h1>
                    <p className="text-secondary-600 text-lg">Everything you need to know about using Skipped.</p>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {['all', 'buying', 'selling', 'shipping', 'safety'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => {
                                setActiveCategory(cat as any);
                                setOpenIndex(null);
                            }}
                            className={`px-6 py-2 rounded-full font-medium capitalize transition-all ${activeCategory === cat
                                ? 'bg-primary-600 text-white shadow-lg scale-105'
                                : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden transition-all duration-300 hover:shadow-md"
                        >
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                            >
                                <span className="font-bold text-lg text-secondary-900">{faq.question}</span>
                                <span className={`transform transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                    <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>
                            <div
                                className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                    }`}
                            >
                                <div className="p-6 pt-0 text-secondary-600 border-t border-secondary-50">
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still Stuck? */}
                <div className="mt-20 text-center bg-secondary-900 text-white rounded-2xl p-10 shadow-xl">
                    <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                    <p className="text-secondary-300 mb-8">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                    <Link
                        href="/contact"
                        className="bg-white text-secondary-900 font-bold px-8 py-3 rounded-lg hover:bg-primary-50 transition"
                    >
                        Get in Touch
                    </Link>
                </div>
            </div>
        </div>
    );
}
