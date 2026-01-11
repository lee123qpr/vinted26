'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const token = formData.get('turnstileToken') as string;

    if (!token) {
        return { error: 'Please verify you are human.' };
    }

    const isHuman = await verifyTurnstileToken(token);
    if (!isHuman) {
        return { error: 'Security check failed. Please try again.' };
    }

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function signout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath('/', 'layout');
    redirect('/auth/login');
}

interface TurnstileVerifyResponse {
    success: boolean;
    'error-codes': string[];
    challenge_ts?: string;
    hostname?: string;
}

async function verifyTurnstileToken(token: string) {
    // Authenticate the token with Cloudflare
    const secretKey = process.env.TURNSTILE_SECRET_KEY || '1x00000000000000000000BB'; // Default to Test Key if not set

    // Note: Cloudflare expects x-www-form-urlencoded body
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);

    try {
        const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            body: formData,
        });

        const data: TurnstileVerifyResponse = await result.json();
        return data.success;
    } catch (e) {
        console.error("Turnstile error:", e);
        return false;
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const fullName = formData.get('fullName') as string;
    const username = formData.get('username') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const token = formData.get('turnstileToken') as string;

    if (!token) {
        return { error: 'Please complete the security check.' };
    }

    const isHuman = await verifyTurnstileToken(token);
    if (!isHuman) {
        return { error: 'Security check failed. Please try again.' };
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
                username: username,
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.user && !data.session) {
        return { success: true, message: 'Check your email for confirmation.' };
    }

    // Auto-login active
    revalidatePath('/', 'layout');
    redirect('/dashboard');
}

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const token = formData.get('turnstileToken') as string;
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    if (!token) {
        return { error: 'Please verify you are human.' };
    }

    const isHuman = await verifyTurnstileToken(token);
    if (!isHuman) {
        return { error: 'Security check failed. Please try again.' };
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    });

    if (error) {
        // Security: Don't reveal if email exists or not, but for dev we might log it
        console.error('Forgot Password Error:', error);
        // We can return a generic success message to prevent enumeration
    }

    return { success: true, message: 'If an account exists with this email, you will receive a password reset link.' };
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
        return { error: 'Passwords do not match.' };
    }

    const { error } = await supabase.auth.updateUser({
        password: password
    });

    if (error) {
        return { error: error.message };
    }

    redirect('/dashboard');
}
