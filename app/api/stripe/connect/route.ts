import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Check if user already has a Stripe Account ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_account_id')
            .eq('id', user.id)
            .single();

        let accountId = profile?.stripe_account_id;

        // 2. If not, create one (Express account for easiest onboarding)
        if (!accountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'GB', // Hardcoded to UK for now based on currency
                email: user.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });

            accountId = account.id;

            // Save to DB immediately
            await supabase
                .from('profiles')
                .update({ stripe_account_id: accountId })
                .eq('id', user.id);
        }

        // 3. Create Account Link (The Onboarding URL)
        const accountLink = await stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings?stripe_refresh=true`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/stripe/callback?account_id=${accountId}`,
            type: 'account_onboarding',
        });

        return NextResponse.json({ url: accountLink.url });

    } catch (error: any) {
        console.error('Stripe Connect Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
