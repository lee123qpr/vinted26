import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface DisputeModalProps {
    isOpen: boolean;
    onClose: () => void;
    transactionId: string;
}

export default function DisputeModal({ isOpen, onClose, transactionId }: DisputeModalProps) {
    const [step, setStep] = useState<'prompt' | 'form'>('prompt');
    const [reason, setReason] = useState('item_not_received');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Upload Images
            const evidenceUrls: string[] = [];
            if (files.length > 0) {
                setUploading(true);
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${transactionId}/${Math.random()}.${fileExt}`;
                    const { data, error } = await supabase.storage
                        .from('dispute-evidence')
                        .upload(fileName, file);

                    if (error) throw error;
                    if (data?.path) {
                        // We can just store the path or the full URL. Path is better for storage ops, usually URL for display.
                        // Let's assume we store the path for now or construct public URL if public. 
                        // But bucket is private. So we store the path `transactionId/filename`.
                        evidenceUrls.push(data.path);
                    }
                }
                setUploading(false);
            }

            // 2. Submit Dispute
            const { createDispute } = await import('@/app/actions/orders');
            const result = await createDispute(transactionId, reason, description, evidenceUrls);

            if (result.error) throw new Error(result.error);

            setSuccess(true);
            router.refresh();
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setDescription('');
                setFiles([]);
                setStep('prompt');
            }, 2000);

        } catch (error: any) {
            console.error('Dispute Error:', error);
            alert(error.message || 'Failed to raise dispute. Please try again.');
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-fade-in-up">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 transition"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-secondary-900 mb-2">Dispute Raised</h3>
                        <p className="text-secondary-500">Admin and Seller have been notified.</p>
                    </div>
                ) : step === 'prompt' ? (
                    <div className="text-center py-4">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                        </div>
                        <h2 className="text-xl font-bold text-secondary-900 mb-2">Have you contacted the seller?</h2>
                        <p className="text-secondary-500 mb-6">
                            We strongly recommend trying to resolve the issue directly with the seller first. Disputes should only be raised if you cannot reach an agreement.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => setStep('form')}
                                className="w-full btn-primary py-3 bg-red-600 hover:bg-red-700 border-transparent text-white"
                            >
                                I have contacted them, proceed to dispute
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full btn-outline py-3"
                            >
                                Cancel, I will message them first
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <h2 className="text-xl font-bold text-red-600 mb-1">Report an Issue</h2>
                        <p className="text-sm text-secondary-500 mb-6">Please provide photos and details.</p>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Reason</label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="input-field"
                                >
                                    <option value="item_not_received">Item Not Received</option>
                                    <option value="not_as_described">Item Not As Described</option>
                                    <option value="damaged">Item Damaged</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="input-field min-h-[80px]"
                                    placeholder="Explain the issue in detail..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-2">Evidence (Photos)</label>
                                <div className="border-2 border-dashed border-secondary-200 rounded-lg p-4 text-center cursor-pointer hover:bg-secondary-50 transition relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="text-secondary-500 text-sm">
                                        <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
                                        <p className="text-xs mt-1">PNG, JPG up to 5MB</p>
                                    </div>
                                </div>
                                {files.length > 0 && (
                                    <div className="mt-2 space-y-2">
                                        {files.map((file, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm bg-secondary-50 p-2 rounded">
                                                <span className="truncate max-w-[200px]">{file.name}</span>
                                                <button type="button" onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700">
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || uploading}
                                className="w-full bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition shadow-lg"
                            >
                                {uploading ? 'Uploading Evidence...' : loading ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}
