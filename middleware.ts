import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    console.log('Middleware invoked for:', request.nextUrl.pathname);

    // TEMPORARY DEBUG: Skip all Supabase logic to verify runtime stability
    // passing the request through
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
