import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Supabase environment variables are missing!');
    }

    return createBrowserClient(
        supabaseUrl!,
        supabaseAnonKey!
    );
};

// Singleton instance for client-side usage
export const supabase = createClient();
