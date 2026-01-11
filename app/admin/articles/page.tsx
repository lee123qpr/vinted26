
import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminArticlesPage() {
    const supabase = await createAdminClient();
    const { data: articles } = await supabase.from('articles').select('*').order('created_at', { ascending: false });

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">News & Articles</h1>
                <Link href="/admin/articles/new" className="btn-primary flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    New Article
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-900">Title</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-900">Slug</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 text-right">Date</th>
                            <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {articles && articles.length > 0 ? articles.map((a) => (
                            <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {a.title}
                                </td>
                                <td className="px-6 py-4">
                                    {a.is_published ? (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Published</span>
                                    ) : (
                                        <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">Draft</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">
                                    /articles/{a.slug}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {new Date(a.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2 items-center">
                                    <Link href={`/admin/articles/${a.id}/edit`} className="text-primary-600 hover:text-primary-800 font-medium px-3 py-1 bg-primary-50 rounded hover:bg-primary-100 transition">
                                        Edit
                                    </Link>
                                    <form action={async () => {
                                        'use server';
                                        const { deleteArticle } = await import('@/app/actions/admin-articles');
                                        await deleteArticle(a.id);
                                    }}>
                                        <button className="text-red-500 hover:text-red-700 font-medium px-3 py-1 hover:bg-red-50 rounded transition">
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400">No articles yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
