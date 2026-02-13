import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.skipped-uk.com';
    const supabase = await createClient();

    // 1. Static Routes
    const staticRoutes = [
        '',
        '/how-it-works',
        '/about',
        '/sell',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 1,
    }));

    // 2. Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('slug, updated_at');

    const categoryRoutes = (categories || []).map((cat) => ({
        url: `${baseUrl}/category/${cat.slug}`,
        lastModified: new Date(cat.updated_at || new Date()),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // 3. Fetch Active Listings (Limit to 1000 for V1 performance, can paginate or chunk later)
    const { data: listings } = await supabase
        .from('listings')
        .select('id, updated_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1000);

    const listingRoutes = (listings || []).map((listing) => ({
        url: `${baseUrl}/listing/${listing.id}`,
        lastModified: new Date(listing.updated_at || new Date()),
        changeFrequency: 'daily' as const,
        priority: 0.9, // Higher priority as these are the core content
    }));

    return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
