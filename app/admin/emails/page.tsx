'use client';

import { useState, useEffect } from 'react';
import { sendTestEmail, renderTemplate } from '@/app/actions/email-debug';

const templates = {
    'welcome': 'Welcome Email',
    'item-sold': 'Item Sold',
    'order-confirmation': 'Order Confirmation',
    'order-shipped': 'Order Shipped',
    'reset-password': 'Reset Password',
    'new-listings': 'New Listings Digest',
    'admin-warning': 'Admin Warning',
};

export default function EmailLabPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates>('welcome');
    const [testEmail, setTestEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [loadingPreview, setLoadingPreview] = useState(true);

    // Fetch HTML when template changes
    useEffect(() => {
        let mounted = true;
        const loadPreview = async () => {
            setLoadingPreview(true);
            const html = await renderTemplate(selectedTemplate);
            if (mounted) {
                setPreviewHtml(html);
                setLoadingPreview(false);
            }
        };
        loadPreview();
        return () => { mounted = false; };
    }, [selectedTemplate]);

    const handleSendTest = async () => {
        if (!testEmail) return;
        setStatus('sending');

        try {
            const result = await sendTestEmail(selectedTemplate, testEmail);

            if (result.success) {
                setStatus('success');
            } else {
                setStatus('error');
                alert(result.error);
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-secondary-900">Email Laboratory 🧪</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-150px)]">
                {/* Sidebar: Controls */}
                <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-secondary-200 lg:col-span-1 h-fit">
                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Select Template</label>
                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value as any)}
                            className="w-full border-secondary-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                            {Object.entries(templates).map(([key, name]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Send Test To</label>
                        <div className="flex space-x-2">
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                className="flex-1 border-secondary-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            />
                            <button
                                onClick={handleSendTest}
                                disabled={status === 'sending' || !testEmail}
                                className="bg-secondary-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black disabled:opacity-50 transition-colors"
                            >
                                {status === 'sending' ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                        {status === 'success' && <p className="text-green-600 text-sm mt-2">✓ Test email sent successfully!</p>}
                    </div>
                </div>

                {/* Main: Preview */}
                <div className="lg:col-span-2 bg-secondary-100 rounded-xl border border-secondary-200 overflow-hidden flex flex-col">
                    <div className="bg-white border-b border-secondary-200 px-4 py-2 flex justify-between items-center">
                        <span className="font-mono text-xs text-secondary-500">Preview Mode (Iframe)</span>
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                    </div>

                    {/* Iframe Preview Container */}
                    <div className="flex-1 overflow-hidden relative bg-gray-100 flex justify-center items-start pt-8 pb-8">
                        {loadingPreview ? (
                            <div className="text-secondary-400 animate-pulse">Loading template...</div>
                        ) : (
                            <iframe
                                srcDoc={previewHtml}
                                className="bg-white shadow-2xl w-full max-w-[600px] h-full rounded-lg border border-gray-200"
                                style={{ height: 'calc(100% - 40px)' }}
                                title="Email Preview"
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
