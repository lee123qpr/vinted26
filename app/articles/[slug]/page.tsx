import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { format } from 'date-fns';
import ShareButtons from '@/components/ShareButtons';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import JsonLd from '@/components/JsonLd';
import RelatedArticles from '@/components/RelatedArticles';

export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = await createClient();
    const { slug } = await params;

    const { data: article } = await supabase
        .from('articles')
        .select('title, summary')
        .eq('slug', slug)
        .single();

    if (!article) return { title: 'Article Not Found' };

    return {
        title: `${article.title} | Skipped News`,
        description: article.summary,
    };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const supabase = await createClient();
    const { slug } = await params;

    const { data: article } = await supabase
        .from('articles')
        .select('*, profiles(full_name)')
        .eq('slug', slug)
        .single();

    if (!article) {
        notFound();
    }

    const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.skipped-uk.com';
    const articleUrl = `${BASE_URL}/articles/${article.slug}`;

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.summary,
        url: articleUrl,
        ...(article.cover_image && { image: [article.cover_image] }),
        datePublished: article.published_at,
        dateModified: article.updated_at || article.published_at,
        author: {
            '@type': 'Person',
            name: article.profiles?.full_name || 'Skipped Editorial Team',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Skipped',
            logo: { '@type': 'ImageObject', url: `${BASE_URL}/logo.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Articles', item: `${BASE_URL}/articles` },
            { '@type': 'ListItem', position: 3, name: article.title, item: articleUrl },
        ],
    };

    return (
        <article className="min-h-screen bg-white pb-20">
            <JsonLd data={articleSchema} />
            <JsonLd data={breadcrumbSchema} />
            {/* Header Image */}
            {article.cover_image && (
                <div className="relative w-full h-[400px] md:h-[500px]">
                    <Image
                        src={article.cover_image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-8 container-custom text-white">
                        <div className="max-w-4xl mx-auto">
                            <span className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
                                News
                            </span>
                        </div>
                    </div>
                </div>
            )}

            <div className={`container-custom ${!article.cover_image ? 'pt-20' : 'pt-8'}`}>
                <div className="max-w-3xl mx-auto">
                    {/* Title Section (if no image, or below image) */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-5xl font-black text-secondary-900 mb-6 leading-tight">
                            {article.title}
                        </h1>

                        <div className="flex items-center space-x-4 text-sm text-secondary-500 border-b border-secondary-100 pb-8">
                            {article.profiles?.full_name && (
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                                        {article.profiles.full_name[0]}
                                    </div>
                                    <span className="font-medium text-secondary-900">{article.profiles.full_name}</span>
                                </div>
                            )}
                            <span>&bull;</span>
                            <time dateTime={article.published_at}>
                                {article.published_at ? format(new Date(article.published_at), 'MMMM d, yyyy') : 'Unpublished'}
                            </time>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-12">
                        <MarkdownRenderer content={article.content} />
                    </div>

                    {/* Share */}
                    <div className="py-12 border-t border-secondary-100 mt-12">
                        <ShareButtons
                            title={article.title}
                            url={articleUrl}
                        />
                    </div>

                    {/* Related Articles */}
                    <RelatedArticles currentArticleId={article.id} />

                </div>
            </div>
        </article>
    );
}
