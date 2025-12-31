import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import SignOutButton from '@/components/SignOutButton';

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
    const displayInitial = profile?.username?.[0]?.toUpperCase() || userEmail[0]?.toUpperCase() || 'U';

    return (
        <div className="min-h-screen bg-secondary-50 py-8">
            <div className="container-custom">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Dashboard Sidebar */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
                            <div className="flex items-center space-x-3 mb-6 p-2">
                                <Link href={profile?.id ? `/profile/${profile.id}` : '#'} className="block relative group">
                                    {profile?.avatar_url ? (
                                        <div className="w-10 h-10 rounded-full overflow-hidden relative border border-secondary-200">
                                            <Image
                                                src={profile.avatar_url}
                                                alt={displayName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                                            {displayInitial}
                                        </div>
                                    )}
                                </Link>
                                <div className="overflow-hidden">
                                    <p className="font-semibold text-secondary-900 truncate capitalize" title={displayName}>{displayName}</p>
                                    <Link
                                        href={profile?.id ? `/profile/${profile.id}` : '#'}
                                        className="text-xs text-secondary-500 hover:text-primary-600 transition-colors block"
                                    >
                                        View Public Profile
                                    </Link>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                <Link href="/dashboard" className="flex items-center px-4 py-2.5 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition font-medium">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    Overview
                                </Link>
                                <div className="pt-4 pb-2">
                                    <p className="px-4 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Selling</p>
                                </div>
                                <Link href="/dashboard/listings" className="flex items-center px-4 py-2.5 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition font-medium">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                    My Listings
                                </Link>
                                <Link href="/dashboard/sales" className="flex items-center px-4 py-2.5 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition font-medium">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Sold Items
                                </Link>

                                <div className="pt-4 pb-2">
                                    <p className="px-4 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Buying</p>
                                </div>
                                <Link href="/dashboard/orders" className="flex items-center px-4 py-2.5 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition font-medium">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    My Orders
                                </Link>
                                <Link href="/favourites" className="flex items-center px-4 py-2.5 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition font-medium">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    Favourites
                                </Link>

                                <div className="pt-4 pb-2">
                                    <p className="px-4 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Account</p>
                                </div>
                                <Link href="/messages" className="flex items-center px-4 py-2.5 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition font-medium">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                    Messages
                                </Link>
                                <Link href="/dashboard/impact" className="flex items-center px-4 py-2.5 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition font-medium">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Carbon Impact
                                </Link>
                                <Link href="/dashboard/settings" className="flex items-center px-4 py-2.5 text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition font-medium">
                                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Settings
                                </Link>
                            </nav>

                            <div className="mt-8 pt-4 border-t border-secondary-100 px-2">
                                <SignOutButton />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
