
import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
    const supabase = await createAdminClient();
    const { id } = await params;

    const { data: article } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

    if (!article) notFound();

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Edit Article</h1>
            <ArticleForm article={article} />
        </div>
    );
}
