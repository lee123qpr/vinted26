import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Please enter a valid email address.' },
                { status: 400 }
            );
        }

        // Initialize Supabase Admin Client to bypass RLS for checking uniqueness if needed,
        // or just use the standard client since we set the policy to allow public inserts.
        // For simplicity and security of keeping anon key public, we rely on the RLS policy we just created.
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const { error } = await supabase
            .from('newsletter_subscribers')
            .insert([{ email }]);

        if (error) {
            // Handle unique constraint violation specifically (Postgres error 23505)
            if (error.code === '23505') {
                return NextResponse.json(
                    { error: 'This email is already subscribed.' },
                    { status: 409 }
                );
            }
            throw error;
        }

        return NextResponse.json({ success: true, message: 'Thanks for subscribing!' });
    } catch (error) {
        console.error('Newsletter Error:', error);
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        );
    }
}
