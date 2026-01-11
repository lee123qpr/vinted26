'use client';

import { saveArticle } from '@/app/actions/admin-articles';
import MarkdownEditor from '@/components/MarkdownEditor';
import Image from 'next/image';
import TagInput from './TagInput';

export default function ArticleForm({ article }: { article?: any }) {
    return (
        <form action={saveArticle} className="space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
            {article?.id && <input type="hidden" name="id" value={article.id} />}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                        <input name="title" defaultValue={article?.title} required className="w-full input-field text-lg font-bold" placeholder="e.g. Sustainable Fashion Trends 2026" />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                        <TagInput name="tags" defaultValue={article?.tags} />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
                        <MarkdownEditor name="content" defaultValue={article?.content} placeholder="# Start writing..." required />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image</label>
                        {article?.cover_image && (
                            <div className="mb-4 relative w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                                <Image src={article.cover_image} alt="Current cover" fill className="object-cover" />
                            </div>
                        )}
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors bg-slate-50">
                            <input type="file" name="cover_image" accept="image/*" className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mb-2" />
                            <p className="text-xs text-slate-400">Change recommended: 1200x630px JPG/PNG</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Summary (SEO)</label>
                        <textarea name="summary" defaultValue={article?.summary} className="w-full input-field h-32 text-sm" placeholder="Brief overview for search engines and cards..." />
                    </div>

                    {/* Slug (Hidden unless needed) */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Slug</label>
                        <input name="slug" defaultValue={article?.slug} className="w-full input-field text-sm font-mono text-slate-500" placeholder="auto-generated-from-title" />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <input type="checkbox" name="is_published" id="pub" defaultChecked={article?.is_published} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                        <label htmlFor="pub" className="font-medium text-slate-900">Publish immediately</label>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 text-lg font-bold shadow-lg shadow-primary-900/10">
                        {article ? 'Update Article' : 'Save Article'}
                    </button>

                </div>
            </div>
        </form>
    );
}
