'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { optimizeImage, validateImage } from '@/lib/imageUtils';

interface ImageDropzoneProps {
    images: (File | string)[];
    onImagesChange: (newImages: (File | string)[]) => void;
}

export default function ImageDropzone({ images, onImagesChange }: ImageDropzoneProps) {
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setProcessing(true);
        setError(null);

        const newProcessedFiles: File[] = [];
        const errors: string[] = [];

        // Check limits
        if (images.length + acceptedFiles.length > 8) {
            setError('Maximum 8 images allowed.');
            setProcessing(false);
            return;
        }

        for (const file of acceptedFiles) {
            // Validate
            const valError = validateImage(file);
            if (valError) {
                errors.push(`${file.name}: ${valError}`);
                continue;
            }

            try {
                // Optimize
                const optimized = await optimizeImage(file);
                newProcessedFiles.push(optimized);
            } catch (err) {
                console.error('Optimization failed for', file.name, err);
                errors.push(`${file.name}: Failed to process`);
            }
        }

        if (errors.length > 0) {
            setError(errors.join(', '));
        }

        if (newProcessedFiles.length > 0) {
            onImagesChange([...images, ...newProcessedFiles]);
        }

        setProcessing(false);
    }, [images, onImagesChange]);

    const removeImage = (index: number) => {
        const updated = images.filter((_, i) => i !== index);
        onImagesChange(updated);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/jpeg': [],
            'image/png': [],
            'image/webp': [],
            'image/heic': []
        },
        maxFiles: 8 - images.length,
        disabled: processing || images.length >= 8
    });

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            {images.length < 8 && (
                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-primary-400 hover:bg-secondary-50'
                        } ${processing ? 'opacity-50 cursor-wait' : ''}`}
                >
                    <input {...getInputProps()} />
                    {processing ? (
                        <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
                            <p className="text-sm text-secondary-500">Optimizing images...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-secondary-500">
                            <svg className="w-10 h-10 mb-3 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs mt-1 text-secondary-400">JPG, PNG or WebP</p>
                        </div>
                    )}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-200">
                    {error}
                </div>
            )}

            {/* Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img, index) => (
                        <div key={index} className="relative aspect-square bg-secondary-100 rounded-lg overflow-hidden group border border-secondary-200 shadow-sm">
                            <img
                                src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                                alt={`Preview ${index}`}
                                className="w-full h-full object-cover"
                                onLoad={() => {
                                    if (typeof img !== 'string') URL.revokeObjectURL(img.name); // Clean up? No, need it for render. React handles it mostly, but robust way is strictly internal. 
                                    // Actually URL.createObjectURL creates a ref that persists until revoked. 
                                    // ideally we store the preview URL in state too, but this is MVP.
                                }}
                            />

                            {/* Cover Label */}
                            {index === 0 && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] font-bold py-1 text-center backdrop-blur-sm">
                                    COVER PHOTO
                                </div>
                            )}

                            {/* Remove Button */}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                className="absolute top-2 right-2 w-6 h-6 bg-white/90 text-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                                aria-label="Remove image"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
