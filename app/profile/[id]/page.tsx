import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import ProfileClient from './ProfileClient';
import { notFound } from 'next/navigation';

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url')
        .eq('id', id)
        .single();

    if (!profile) {
        return {
            title: 'User Not Found | Skipped',
        };
    }

    return {
        title: `${profile.username} | Skipped`,
        description: profile.bio?.substring(0, 160) || `Check out ${profile.username}'s profile on Skipped.`,
        openGraph: {
            title: `${profile.username} on Skipped`,
            description: profile.bio?.substring(0, 160),
            images: profile.avatar_url ? [profile.avatar_url] : [],
        },
    };
}

export default async function ProfilePage({ params }: Props) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch all data in parallel
    const [profileRes, listingsRes, reviewsRes] = await Promise.all([
        supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single(),

        supabase
            .from('listings')
            .select(`
                id,
                title,
                price_gbp,
                is_free,
                postcode_area,
                condition,
                carbon_saved_kg,
                include_carbon_certificate,
                created_at,
                listing_images (
                    image_url
                )
            `)
            .eq('seller_id', id)
            .eq('status', 'active')
            .order('created_at', { ascending: false }),

        supabase
            .from('reviews')
            .select(`
                id,
                rating,
                review_text,
                created_at,
                reviewer:reviewer_id (
                    username,
                    avatar_url
                ),
                transaction:transaction_id (
                    listing:listing_id (
                        title
                    )
                )
            `)
            .eq('reviewee_id', id)
            .order('created_at', { ascending: false })
    ]);

    const { data: profile, error: profileError } = profileRes;
    const { data: listings } = listingsRes;
    const { data: reviews } = reviewsRes;

    if (profileError || !profile) {
        notFound();
    }

    return (
        <ProfileClient
            profile={profile}
            listings={listings || []}
            reviews={reviews || []}
        />
    );
}
