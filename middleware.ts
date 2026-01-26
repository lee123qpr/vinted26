import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const pathname = request.nextUrl.pathname;

    // Always set x-pathname for layout/component usage
    supabaseResponse.headers.set('x-pathname', pathname);

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error('Middleware Error: Missing Supabase Environment Variables');
            return supabaseResponse;
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        );
                        // Create a NEW response if cookies are changed to ensure headers/cookies are synced
                        supabaseResponse = NextResponse.next({
                            request,
                        });
                        // Re-set x-pathname on the NEW response
                        supabaseResponse.headers.set('x-pathname', pathname);
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        // 1. Handle "Suspended/Banned" Status (Security Block)
        if (user && !pathname.startsWith('/auth/suspended') && !pathname.startsWith('/auth/callback')) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('account_status')
                .eq('id', user.id)
                .single();

            if (profile && (profile.account_status === 'suspended' || profile.account_status === 'banned')) {
                const url = request.nextUrl.clone();
                url.pathname = '/auth/suspended';
                return NextResponse.redirect(url);
            }
        }

        // 2. Redirect Authenticated Users away from Auth pages
        if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
            return NextResponse.redirect(url);
        }

        // 3. Admin Route Protection
        if (pathname.startsWith('/admin')) {
            if (!user) {
                const url = request.nextUrl.clone();
                url.pathname = '/auth/login';
                url.searchParams.set('redirectTo', pathname);
                return NextResponse.redirect(url);
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (!profile || !profile.is_admin) {
                const url = request.nextUrl.clone();
                url.pathname = '/';
                return NextResponse.redirect(url);
            }
        }

        // 4. General Protected Routes
        const protectedPrefixes = ['/sell', '/dashboard', '/messages', '/checkout'];
        if (!user && protectedPrefixes.some(prefix => pathname.startsWith(prefix))) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            url.searchParams.set('redirectTo', pathname);
            return NextResponse.redirect(url);
        }

        return supabaseResponse;
    } catch (error) {
        console.error('Middleware Error:', error);
        return supabaseResponse;
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
