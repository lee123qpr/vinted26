/**
 * optimizing images on the client side using HTML5 Canvas.
 * This reduces upload size and bandwidth usage.
 */

export const optimizeImage = (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        // 1. Create an image element
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            // 2. Calculate new dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            // 3. Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            // 4. Draw image to canvas
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);

            // 5. Export to Blob -> File
            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const optimizedFile = new File([blob], file.name, {
                            type: 'image/jpeg', // Force JPEG for better compression
                            lastModified: Date.now(),
                        });
                        resolve(optimizedFile);
                    } else {
                        reject(new Error('Canvas to Blob conversion failed'));
                    }
                    URL.revokeObjectURL(img.src);
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(img.src);
            reject(err);
        };
    });
};

export const validateImage = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
    if (!validTypes.includes(file.type)) {
        return 'Invalid file type. Only JPG, PNG, and WebP are allowed.';
    }
    // 10MB limit (even before compression, to be safe)
    if (file.size > 10 * 1024 * 1024) {
        return 'File size too large. Max 10MB.';
    }
    return null;
};
