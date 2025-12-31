'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Image from 'next/image';

interface AvatarUploadProps {
    uid: string;
    url: string | null;
    size: number;
    onUpload: (url: string) => void;
}

export default function AvatarUpload({ uid, url, size, onUpload }: AvatarUploadProps) {
    const [avatarUrl, setAvatarUrl] = useState<string | null>(url);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (url) setAvatarUrl(url);
    }, [url]);

    const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.');
            }

            const file = event.target.files[0];
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setAvatarUrl(data.publicUrl);
            onUpload(data.publicUrl);
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error.message || 'Error uploading avatar');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative overflow-hidden rounded-full border-2 border-secondary-200 bg-secondary-100"
                style={{ height: size, width: size }}
            >
                {avatarUrl ? (
                    <Image
                        src={avatarUrl}
                        alt="Avatar"
                        className="object-cover"
                        fill
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-secondary-400">
                        <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-medium text-sm">
                        Uploading...
                    </div>
                )}
            </div>

            <div>
                <label className="btn-outline cursor-pointer text-sm py-2 px-4" htmlFor="single">
                    {uploading ? 'Uploading ...' : 'Upload New Photo'}
                </label>
                <input
                    style={{
                        visibility: 'hidden',
                        position: 'absolute',
                    }}
                    type="file"
                    id="single"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                />
            </div>
        </div>
    );
}
