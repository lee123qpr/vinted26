import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('account_id');

    if (!accountId) {
        return NextResponse.json({ error: 'Missing account_id' }, { status: 400 });
    }

    try {
        // 1. Verify the account status with Stripe
        const account = await stripe.accounts.retrieve(accountId);

        const chargesEnabled = account.charges_enabled; // secure way to check if they finished

        // 2. Update DB
        const adminSupabase = await createAdminClient();

        const { error } = await adminSupabase
            .from('profiles')
            .update({
                stripe_charges_enabled: chargesEnabled
            })
            .eq('stripe_account_id', accountId);

        if (error) {
            console.error('Failed to update profile status:', error);
        }

    } catch (error) {
        console.error('Stripe Callback Error:', error);
    }

    // 3. Redirect back to dashboard
    return redirect('/dashboard/settings?stripe_success=true');
}
