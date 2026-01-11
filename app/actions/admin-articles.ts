
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function saveArticle(formData: FormData) {
    const supabase = await createAdminClient();

    // Get Current User (Author)
    const { data: { user } } = await supabase.auth.getUser();

    const title = formData.get('title') as string;
    const slug = formData.get('slug') as string || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const content = formData.get('content') as string;
    const summary = formData.get('summary') as string;
    const isPublished = formData.get('is_published') === 'on';
    const tagsRaw = formData.get('tags') as string;
    const tags = tagsRaw ? tagsRaw.split(',').filter(t => t.trim().length > 0) : [];
    const coverImageFile = formData.get('cover_image') as File;

    // Basic validation
    if (!title || !content) throw new Error('Title and Content are required');

    let cover_image = null;

    // Handle Image Upload
    if (coverImageFile && coverImageFile.size > 0) {
        const filename = `${Date.now()}-${coverImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('articles')
            .upload(filename, coverImageFile, {
                upsert: false,
                contentType: coverImageFile.type
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error('Failed to upload image: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
            .from('articles')
            .getPublicUrl(filename);

        cover_image = publicUrl;
    }

    const id = formData.get('id') as string;

    // Build payload
    const payload: any = {
        title,
        slug,
        content,
        summary,
        is_published: isPublished,
        published_at: isPublished ? (new Date().toISOString()) : null,
        tags
    };

    if (cover_image) {
        payload.cover_image = cover_image;
    }

    // If Insert, add author
    if (!id) {
        payload.author_id = user?.id;
    }

    let error;
    if (id) {
        // Update
        const res = await supabase.from('articles').update(payload).eq('id', id);
        error = res.error;
    } else {
        // Insert
        const res = await supabase.from('articles').insert(payload);
        error = res.error;
    }

    if (error) throw new Error('Failed to save article: ' + error.message);

    revalidatePath('/admin/articles');
    revalidatePath('/articles');
    redirect('/admin/articles');
}

export async function deleteArticle(id: string) {
    const supabase = await createAdminClient();
    await supabase.from('articles').delete().eq('id', id);
    revalidatePath('/admin/articles');
}
