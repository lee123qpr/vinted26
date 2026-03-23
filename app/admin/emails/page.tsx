'use client';

import { useState, useEffect } from 'react';
import { sendTestEmail, renderTemplate, getTemplateRaw, saveTemplate } from '@/app/actions/email-debug';

const templates = {
    'welcome': 'Welcome Email',
    'item-sold': 'Item Sold',
    'order-confirmation': 'Order Confirmation',
    'order-shipped': 'Order Shipped',
    'reset-password': 'Reset Password',
    'new-listings': 'New Listings Digest',
    'admin-warning': 'Admin Warning',
    'dispute-update': 'Dispute Update',
};

export default function EmailLabPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates>('welcome');
    const [testEmail, setTestEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
    const [previewHtml, setPreviewHtml] = useState<string>('');
    const [loadingPreview, setLoadingPreview] = useState(true);

    // Editor State
    const [subject, setSubject] = useState('');
    const [bodyHtml, setBodyHtml] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Fetch HTML when template changes
    useEffect(() => {
        let mounted = true;
        const loadPreview = async () => {
            setLoadingPreview(true);
            
            // Fetch Raw DB text
            const raw = await getTemplateRaw(selectedTemplate);
            if (raw && mounted) {
                setSubject(raw.subject);
                setBodyHtml(raw.bodyHtml);
            }

            // Fetch compiled iframe preview
            const html = await renderTemplate(selectedTemplate);
            if (mounted) {
                setPreviewHtml(html);
                setLoadingPreview(false);
            }
        };
        loadPreview();
        return () => { mounted = false; };
    }, [selectedTemplate]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        const res = await saveTemplate(selectedTemplate, subject, bodyHtml);
        if (res.success) {
            setSaveMessage('Saved successfully! Reloading preview...');
            const html = await renderTemplate(selectedTemplate);
            setPreviewHtml(html);
            setTimeout(() => setSaveMessage(''), 3000);
        } else {
            setSaveMessage('Error: ' + res.error);
        }
        setIsSaving(false);
    };

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
            <h1 className="text-2xl font-bold mb-6 text-secondary-900">Email Studio 🧪</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-150px)]">
                {/* Editor Column */}
                <div className="space-y-6 flex flex-col h-full">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Select Template</label>
                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value as any)}
                            className="w-full border-secondary-300 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 mb-4"
                        >
                            {Object.entries(templates).map(([key, name]) => (
                                <option key={key} value={key}>{name}</option>
                            ))}
                        </select>

                        <label className="block text-sm font-medium text-secondary-700 mb-2 mt-4">Email Subject</label>
                        <input 
                            type="text" 
                            className="w-full p-2 border border-secondary-300 rounded-lg"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                        />
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200 flex-1 flex flex-col">
                         <div className="flex justify-between items-center mb-2">
                             <label className="block text-sm font-bold text-secondary-700">Body HTML (Editor)</label>
                             <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="bg-primary-600 text-white px-4 py-1.5 text-sm rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50"
                             >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                             </button>
                         </div>
                         {saveMessage && <p className="text-xs text-green-600 mb-2">{saveMessage}</p>}
                         <textarea 
                            className="flex-1 w-full p-4 font-mono text-sm bg-secondary-900 text-green-400 rounded-lg border-0 focus:ring-2 focus:ring-primary-500 resize-none h-[400px]"
                            value={bodyHtml}
                            onChange={(e) => setBodyHtml(e.target.value)}
                         />
                         <p className="text-xs text-secondary-500 mt-2">Note: Only standard HTML tags allowed (h1, h2, p, strong, a). Do NOT use classList or Tailwind here, layout handles it safely.</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
                        <label className="block text-sm font-medium text-secondary-700 mb-2">Send Live Test To</label>
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
                                {status === 'sending' ? 'Sending...' : 'Send Test'}
                            </button>
                        </div>
                        {status === 'success' && <p className="text-green-600 text-sm mt-2">✓ Test email sent successfully!</p>}
                    </div>
                </div>

                {/* Preview Column */}
                <div className="bg-secondary-100 rounded-xl border border-secondary-200 overflow-hidden flex flex-col h-full">
                    <div className="bg-white border-b border-secondary-200 px-4 py-2 flex justify-between items-center">
                        <span className="font-mono text-xs text-secondary-500">Live Rendered Output (Iframe)</span>
                        <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative bg-gray-100 flex justify-center items-start pt-8 pb-8">
                        {loadingPreview ? (
                            <div className="text-secondary-400 animate-pulse mt-10">Compiling Tailwind UI...</div>
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
