import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';
import DashboardSidebar from './DashboardSidebar';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    let profile = null;
    const { data } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

    if (data) {
        profile = data;
    }

    // Determine display name: Custom logic to handle naming priority
    const userEmail = user.email || '';
    const displayName = profile?.full_name || profile?.username || userEmail.split('@')[0] || 'User';

    // Determine initial: Avatar URL -> Username char -> Email char -> 'U'
    // Determine initial: Avatar URL -> Full Name char -> Email char -> 'U'
    const displayInitial = profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || userEmail[0]?.toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Dashboard Sidebar */}
                    <DashboardSidebar
                        profile={profile}
                        displayInitial={displayInitial}
                        displayName={displayName}
                    />

                    {/* Main Content */}
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
