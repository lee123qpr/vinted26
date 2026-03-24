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
            
            try {
                // Fetch Raw DB text
                const raw = await getTemplateRaw(selectedTemplate);
                if (mounted) {
                    if (raw) {
                        setSubject(raw.subject);
                        setBodyHtml(raw.bodyHtml);
                    } else {
                        setSubject('');
                        setBodyHtml('<p>Template not found in database. Edit here to create it.</p>');
                    }
                }

                // Fetch compiled iframe preview
                const html = await renderTemplate(selectedTemplate);
                if (mounted) {
                    setPreviewHtml(html);
                }
            } catch (err: any) {
                console.error("Failed to load preview:", err);
                if (mounted) {
                    setSubject('Error Loading Template');
                    setBodyHtml(`<p>System Error: ${err.message || 'Unknown error'}</p>`);
                    setPreviewHtml('<p>Error connecting to server actions.</p>');
                }
            } finally {
                if (mounted) setLoadingPreview(false);
            }
        };
        loadPreview();
        return () => { mounted = false; };
    }, [selectedTemplate]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('Saving...');
        try {
            const res = await saveTemplate(selectedTemplate, subject, bodyHtml);
            if (res.success) {
                setSaveMessage('✓ Save Success');
                const html = await renderTemplate(selectedTemplate);
                setPreviewHtml(html);
                setTimeout(() => setSaveMessage(''), 3000);
            } else {
                setSaveMessage('✕ Error: ' + res.error);
            }
        } catch (err: any) {
            console.error(err);
            setSaveMessage('✕ Network Error: ' + (err.message || 'Call failed'));
        } finally {
            setIsSaving(false);
        }
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
        } catch (e: any) {
            console.error(e);
            setStatus('error');
            alert(e.message || "Network Error: Failed to contact the server.");
        }
    };

    const variableHelp: Record<string, string[]> = {
        'welcome': ['{{username}}'],
        'item-sold': ['{{sellerName}}', '{{buyerName}}', '{{itemName}}', '{{itemPrice}}'],
        'order-confirmation': ['{{buyerName}}', '{{itemName}}', '{{totalPrice}}', '{{orderId}}'],
        'order-shipped': ['{{buyerName}}', '{{itemName}}'],
        'reset-password': [],
        'new-listings': ['{{listingCount}}', '{{categoryName}}'],
        'admin-warning': [],
        'dispute-update': ['{{userName}}', '{{disputeId}}', '{{message}}'],
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-secondary-900 flex items-center gap-2">
                Email Studio <span className="text-sm font-normal bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">v2.0</span>
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-150px)]">
                {/* Editor Column */}
                <div className="space-y-4 flex flex-col h-full overflow-y-auto pr-2">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">Select Template</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value as any)}
                                    className="w-full border-secondary-200 rounded-lg shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                >
                                    {Object.entries(templates).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">Email Subject</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter subject line..."
                                    className="w-full p-2 border border-secondary-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-secondary-200 flex-1 flex flex-col min-h-[500px]">
                         <div className="flex justify-between items-center mb-4">
                             <div>
                                <label className="block text-xs font-bold text-secondary-500 uppercase tracking-wider">Body HTML (Handlebars)</label>
                                <p className="text-[10px] text-secondary-400">Use standard HTML tags and {"{{variables}}"}</p>
                             </div>
                             <div className="flex items-center gap-3">
                                 {saveMessage && <span className="text-xs font-bold text-green-600 animate-pulse">{saveMessage}</span>}
                                 <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-primary-600 text-white px-5 py-2 text-sm rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 shadow-lg shadow-primary-600/20 transition-all active:scale-95"
                                 >
                                    {isSaving ? 'Saving...' : 'Save Template'}
                                 </button>
                             </div>
                         </div>
                         
                         <div className="relative flex-1 group">
                            <textarea 
                                className="w-full h-full p-6 font-mono text-sm bg-secondary-900 text-green-400 rounded-xl border-0 focus:ring-4 focus:ring-primary-500/10 resize-none transition-all"
                                value={bodyHtml}
                                onChange={(e) => setBodyHtml(e.target.value)}
                            />
                            
                            {/* Variable Helper Overlay */}
                            <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-2 max-w-[200px] opacity-40 group-hover:opacity-100 transition-opacity">
                                {variableHelp[selectedTemplate]?.map(v => (
                                    <button 
                                        key={v}
                                        onClick={() => {
                                            const el = document.querySelector('textarea');
                                            if (!el) return;
                                            const start = el.selectionStart;
                                            const end = el.selectionEnd;
                                            const newVal = bodyHtml.substring(0, start) + v + bodyHtml.substring(end);
                                            setBodyHtml(newVal);
                                            // Focus back
                                            setTimeout(() => el.focus(), 10);
                                        }}
                                        className="bg-secondary-800 text-[10px] text-secondary-300 px-2 py-1 rounded hover:bg-primary-600 hover:text-white transition-colors"
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                         </div>
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
