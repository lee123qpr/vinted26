import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

export const metadata = {
    title: 'News & Articles | Skipped',
    description: 'Latest news, sustainability tips, and updates from Skipped.',
};

export default async function ArticlesIndexPage({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
    const supabase = await createClient();
    const { tag } = await searchParams;

    let query = supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

    if (tag) {
        query = query.contains('tags', [tag]);
    }

    const { data: articles, error } = await query;

    // Fetch all tags for filter (naive approach for now)
    const { data: allArticles } = await supabase.from('articles').select('tags').eq('is_published', true);
    const uniqueTags = Array.from(new Set(allArticles?.flatMap(a => a.tags || []) || [])).sort();

    if (error) {
        console.error('Error fetching articles:', error);
    }

    return (
        <div className="min-h-screen bg-secondary-50 py-12">
            <div className="container-custom">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-black text-secondary-900 mb-4 tracking-tight">News & Articles</h1>
                    <p className="text-lg text-secondary-600">
                        Insights on sustainability, reclaimed materials, and building a better future.
                    </p>
                </div>

                {/* Tag Filter */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    <Link
                        href="/articles"
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${!tag ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'}`}
                    >
                        All Topics
                    </Link>
                    {uniqueTags.map(t => (
                        <Link
                            key={t}
                            href={`/articles?tag=${encodeURIComponent(t)}`}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${tag === t ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-secondary-600 hover:bg-secondary-100 border border-secondary-200'}`}
                        >
                            #{t}
                        </Link>
                    ))}
                </div>

                {!articles || articles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-secondary-100">
                        <div className="w-16 h-16 bg-secondary-100 text-secondary-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-secondary-900">No articles found</h3>
                        <p className="text-secondary-500 mt-2">
                            {tag ? `No articles tagged with #${tag}` : 'Check back soon for updates.'}
                        </p>
                        {tag && (
                            <Link href="/articles" className="mt-4 inline-block text-primary-600 font-bold hover:underline">
                                View all articles
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article) => (
                            <Link href={`/articles/${article.slug}`} key={article.id} className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-secondary-100 overflow-hidden">
                                <div className="aspect-video relative overflow-hidden bg-secondary-100">
                                    {article.cover_image ? (
                                        <Image
                                            src={article.cover_image}
                                            alt={article.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-secondary-300">
                                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                    )}
                                    {/* Card Tags */}
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                        {article.tags && article.tags.slice(0, 2).map((t: string) => (
                                            <span key={t} className="bg-white/90 backdrop-blur-sm text-secondary-900 text-xs font-bold px-2 py-1 rounded shadow-sm">
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="text-xs font-bold text-primary-600 mb-2 uppercase tracking-wide">
                                        {article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : 'Draft'}
                                    </div>
                                    <h3 className="text-xl font-bold text-secondary-900 mb-3 group-hover:text-primary-700 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <p className="text-secondary-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {article.summary}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-secondary-50 flex items-center text-primary-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                                        Read Article <span className="ml-1">→</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
