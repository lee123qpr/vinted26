'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
    images: string[];
    alt: string;
    renderOverlay?: () => React.ReactNode;
}

export default function ImageGallery({ images, alt, renderOverlay }: ImageGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    // Navigation handlers
    const nextImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveIndex((prev) => (prev + 1) % images.length);
    }, [images.length]);

    const prevImage = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    }, [images.length]);

    // Keyboard support for Lightbox
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!lightboxOpen) return;

            if (e.key === 'Escape') setLightboxOpen(false);
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, nextImage, prevImage]);

    // Prevent scrolling when lightbox is open
    useEffect(() => {
        if (lightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [lightboxOpen]);

    if (!images || images.length === 0) {
        return (
            <div className="bg-secondary-100 rounded-xl aspect-[4/3] flex items-center justify-center text-secondary-400">
                <span className="text-sm">No images available</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image Area */}
            <div
                className="group relative bg-secondary-100 rounded-xl overflow-hidden aspect-[4/3] cursor-zoom-in"
                onClick={() => setLightboxOpen(true)}
            >
                <Image
                    src={images[activeIndex]}
                    alt={`${alt} - View ${activeIndex + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    priority
                />

                {/* Overlay (e.g. Favourites Button) */}
                {renderOverlay && (
                    <div className="absolute top-4 right-4 z-10" onClick={(e) => e.stopPropagation()}>
                        {renderOverlay()}
                    </div>
                )}

                {/* Navigation Arrows (Only if multiple images) */}
                {images.length > 1 && (
                    <>
                        {/* Hidden on mobile default, visible on hover for desktop. Always visible on active interaction if needed, but hover is standard */}
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-secondary-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            aria-label="Previous image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-secondary-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                            aria-label="Next image"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>

                        {/* Image Counter Badge */}
                        <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                            {activeIndex + 1} / {images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeIndex === idx ? 'border-primary-600 ring-1 ring-primary-600' : 'border-transparent opacity-70 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm"
                    onClick={() => setLightboxOpen(false)}
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Main Lightbox Image */}
                    <div className="relative w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center">
                        {/* Large Navigation Arrows */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </>
                        )}

                        <div
                            className="relative w-full h-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Image
                                src={images[activeIndex]}
                                alt={alt}
                                fill
                                className="object-contain"
                                quality={100}
                            />
                        </div>

                        {/* Bottom Counter */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 font-medium">
                            {activeIndex + 1} / {images.length}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
