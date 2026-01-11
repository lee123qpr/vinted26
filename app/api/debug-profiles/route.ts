
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ids = [
        'bf60aff4-610b-41bf-a83c-e990dc5c75b7',
        '73170a43-7781-4ccf-b2cd-7fc2f92adebc'
    ];

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, full_name') // Note: Email is in auth.users, not reachable via public profiles table usually, unless I use admin/auth API.
        .in('id', ids);

    // To get emails, I need auth admin API
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        return NextResponse.json({ profiles, authError }, { status: 500 });
    }

    const targetUsers = users.filter(u => ids.includes(u.id)).map(u => ({ id: u.id, email: u.email }));

    return NextResponse.json({ profiles, targetUsers });
}
