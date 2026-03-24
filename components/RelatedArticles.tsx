import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';

interface RelatedArticlesProps {
    currentArticleId: string;
}

export default async function RelatedArticles({ currentArticleId }: RelatedArticlesProps) {
    const supabase = await createClient();

    const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .eq('is_published', true)
        .neq('id', currentArticleId)
        .order('published_at', { ascending: false })
        .limit(3);

    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <section className="mt-20 pt-16 border-t border-secondary-100">
            <h2 className="text-3xl font-black text-secondary-900 mb-10 tracking-tight">
                Related Articles
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.map((article) => (
                    <Link 
                        key={article.id} 
                        href={`/articles/${article.slug}`}
                        className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-secondary-100 hover:border-primary-200 hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-300"
                    >
                        <div className="relative h-48 w-full overflow-hidden">
                            {article.cover_image ? (
                                <Image
                                    src={article.cover_image}
                                    alt={article.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-secondary-100 flex items-center justify-center">
                                    <span className="text-secondary-400 font-bold uppercase tracking-widest text-xs">Skipped News</span>
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur-sm text-secondary-900 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    Latest
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6 flex flex-col flex-1">
                            <time className="text-xs text-secondary-400 font-medium mb-2 uppercase tracking-wide">
                                {article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : 'Recently'}
                            </time>
                            <h3 className="text-xl font-bold text-secondary-900 group-hover:text-primary-600 transition-colors mb-3 line-clamp-2 leading-tight">
                                {article.title}
                            </h3>
                            <p className="text-sm text-secondary-500 line-clamp-2 mb-4 leading-relaxed">
                                {article.summary}
                            </p>
                            <div className="mt-auto flex items-center text-primary-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                                Read More
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
