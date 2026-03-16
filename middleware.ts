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

        const protectedPrefixes = ['/sell', '/dashboard', '/messages', '/checkout'];
        const isAdminRoute = pathname.startsWith('/admin');
        const isProtectedRoute = isAdminRoute || protectedPrefixes.some(prefix => pathname.startsWith(prefix));

        // 1. Fetch Profile ONLY on Protected Routes to save DB queries
        if (user && isProtectedRoute) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('account_status, is_admin')
                .eq('id', user.id)
                .single();

            // Handle "Suspended/Banned" Status (Security Block)
            if (profile && (profile.account_status === 'suspended' || profile.account_status === 'banned')) {
                const url = request.nextUrl.clone();
                url.pathname = '/auth/suspended';
                return NextResponse.redirect(url);
            }

            // Admin Route Protection
            if (isAdminRoute && (!profile || !profile.is_admin)) {
                const url = request.nextUrl.clone();
                url.pathname = '/';
                return NextResponse.redirect(url);
            }
        }

        // 2. Redirect Unauthenticated Users attempting to access protected routes
        if (!user && isProtectedRoute) {
            const url = request.nextUrl.clone();
            url.pathname = '/auth/login';
            url.searchParams.set('redirectTo', pathname);
            return NextResponse.redirect(url);
        }

        // 3. Redirect Authenticated Users away from Auth pages
        if (user && (pathname === '/auth/login' || pathname === '/auth/signup')) {
            const url = request.nextUrl.clone();
            url.pathname = '/dashboard';
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
