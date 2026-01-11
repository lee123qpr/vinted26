'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Category, SubCategory, SubSubCategory } from '@/types';
import { sortByOrder } from '@/lib/utils';
import NotificationBell from './NotificationBell';
import { createClient } from '@/lib/supabase/client'; // Check this import

const fetchAdminStatus = async (uid: string) => {
    try {
        const { data } = await supabase.from('profiles').select('is_admin').eq('id', uid).single();
        return data?.is_admin || false;
    } catch {
        return false;
    }
};

export default function Navigation() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<Category | null>(null);
    const [navCategories, setNavCategories] = useState<Category[]>([]);
    const [user, setUser] = useState<any>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const router = useRouter();
    const pathname = usePathname();

    const handleSignOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setUserProfile(null);
            setAvatarUrl(null);
            setUnreadCount(0);
            setIsMenuOpen(false);
            window.location.href = '/';
        } catch (error) {
            console.error('Error signing out:', error);
            router.push('/');
        }
    };

    // Close menus and refresh unread count on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsMegaMenuOpen(false);
        if (user) {
            fetchUnreadCount(user.id);
        }
    }, [pathname, user]);

    // Fetch unread count helper
    const fetchUnreadCount = async (userId: string) => {
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_id', userId)
            .eq('is_read', false);
        setUnreadCount(count || 0);
    };

    useEffect(() => {
        let messageSubscription: any;

        // 1. Fetch User & Profile
        const getUser = async () => {
            const { data: { user }, error } = await supabase.auth.getUser();
            console.log('Navigation: getUser result:', user, error);

            setUser(user);

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url, full_name, username, is_admin')
                    .eq('id', user.id)
                    .single();

                setUserProfile(profile);
                if (profile?.avatar_url) {
                    setAvatarUrl(profile.avatar_url);
                }

                // Initial fetch
                fetchUnreadCount(user.id);

                // Realtime subscription for unread count
                messageSubscription = supabase
                    .channel('nav_messages')
                    .on(
                        'postgres_changes',
                        {
                            event: '*',
                            schema: 'public',
                            table: 'messages',
                            filter: `recipient_id=eq.${user.id}`,
                        },
                        () => {
                            // On any change (insert new msg, or update to read), re-fetch count
                            fetchUnreadCount(user.id);
                        }
                    )
                    .subscribe();
            }
        };
        getUser();

        const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            console.log('Navigation: onAuthStateChange:', _event, session?.user);
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('avatar_url, full_name, username, is_admin')
                    .eq('id', session.user.id)
                    .single();
                setUserProfile(profile);
                setAvatarUrl(profile?.avatar_url || null);
                fetchUnreadCount(session.user.id);
            } else {
                setUserProfile(null);
                setAvatarUrl(null);
                setUnreadCount(0);
            }
        });

        // 2. Fetch Categories, Subcategories & Sub-Subcategories
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select(`
                    id, 
                    name, 
                    slug, 
                    icon, 
                    sort_order,
                    subcategories (
                        id, 
                        name, 
                        slug, 
                        sort_order,
                        sub_subcategories (
                            id, 
                            name, 
                            slug, 
                            sort_order
                        )
                    )
                `)
                .order('sort_order');

            if (data) {
                // Sort subcategories and sub-subcategories strictly
                const sortedData = data.map((cat: any) => ({
                    ...cat,
                    subcategories: sortByOrder(cat.subcategories).map((sub: any) => ({
                        ...sub,
                        sub_subcategories: sortByOrder(sub.sub_subcategories || [])
                    }))
                }));
                setNavCategories(sortedData);
                // Set first category as default active for Mega Menu
                if (sortedData.length > 0) setActiveCategory(sortedData[0]);
            }
        };
        fetchCategories();

        return () => {
            authSubscription.unsubscribe();
            if (messageSubscription) supabase.removeChannel(messageSubscription);
        };

    }, []);

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-[2000]">
            {/* SINGLE ROW HEADER */}
            <div className="border-b border-secondary-100 bg-white relative z-[2000]">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-20 gap-6">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 flex-shrink-0 mr-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-2xl font-black tracking-tight text-secondary-900 hidden md:block">Skipped.</span>
                        </Link>

                        <div className="hidden md:flex items-center space-x-6">
                            <Link href="/how-it-works" className="text-secondary-600 hover:text-secondary-900 font-medium text-sm">
                                How it Works
                            </Link>
                        </div>

                        {/* Desktop: Shop by Category Trigger */}
                        <div
                            className="hidden md:block relative"
                            onMouseEnter={() => setIsMegaMenuOpen(true)}
                            onMouseLeave={() => setIsMegaMenuOpen(false)}
                        >
                            <button
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isMegaMenuOpen ? 'bg-primary-50 text-primary-700' : 'bg-secondary-50 text-secondary-700 hover:bg-secondary-100'}`}
                                suppressHydrationWarning
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                                Shop by Category
                            </button>

                            {/* MEGA MENU OVERLAY */}
                            {isMegaMenuOpen && (
                                <div className="absolute top-full left-0 w-[800px] bg-white shadow-2xl border border-secondary-100 rounded-lg -mt-1 flex overflow-hidden min-h-[500px] animate-fade-in-down origin-top-left">
                                    {/* LEFT SIDEBAR: L1 Categories */}
                                    <div className="w-1/3 bg-secondary-50 border-r border-secondary-100 flex flex-col max-h-[600px]">
                                        <div className="flex-1 overflow-y-auto py-4">
                                            {navCategories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    onMouseEnter={() => setActiveCategory(cat)}
                                                    className={`px-6 py-3 cursor-pointer flex items-center justify-between group transition-colors ${activeCategory?.id === cat.id ? 'bg-white text-primary-700 border-l-4 border-primary-500 shadow-sm' : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">{cat.icon}</span>
                                                        <span className="font-semibold text-sm">{cat.name}</span>
                                                    </div>
                                                    {activeCategory?.id === cat.id && (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        {/* View All Fixed Footer */}
                                        <div className="p-4 border-t border-secondary-200 bg-secondary-100">
                                            <Link
                                                href="/search"
                                                className="flex items-center justify-center w-full py-2 bg-white border border-secondary-300 rounded-lg text-primary-600 font-bold text-sm hover:bg-primary-50 hover:border-primary-200 transition-all shadow-sm"
                                                onClick={() => setIsMegaMenuOpen(false)}
                                            >
                                                View All Items
                                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* RIGHT CONTENT: L2 & L3 Grid */}
                                    <div className="w-2/3 p-8 overflow-y-auto max-h-[600px] bg-white">
                                        {activeCategory && (
                                            <div className="animate-fade-in">
                                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-secondary-100">
                                                    <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                                                        {activeCategory.icon} {activeCategory.name}
                                                    </h2>
                                                    <Link href={`/category/${activeCategory.slug}`} className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                                                        View All
                                                    </Link>
                                                </div>

                                                <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                                                    {activeCategory.subcategories.map((sub: SubCategory) => (
                                                        <div key={sub.id} className="break-inside-avoid">
                                                            <Link
                                                                href={`/category/${activeCategory.slug}?subcategory=${sub.slug}`}
                                                                className="font-bold text-secondary-900 hover:text-primary-600 text-sm mb-2 block"
                                                            >
                                                                {sub.name}
                                                            </Link>

                                                            {/* L3 List */}
                                                            <ul className="space-y-1.5 pl-1 border-l-2 border-secondary-100 ml-1">
                                                                {sub.sub_subcategories && sub.sub_subcategories.length > 0 && (
                                                                    sub.sub_subcategories.map((subSub: SubSubCategory) => (
                                                                        <li key={subSub.id}>
                                                                            <Link
                                                                                href={`/category/${activeCategory.slug}?subcategory=${sub.slug}&detail=${subSub.slug}`}
                                                                                className="text-xs text-secondary-500 hover:text-primary-600 hover:translate-x-1 transition-transform block py-0.5"
                                                                            >
                                                                                {subSub.name}
                                                                            </Link>
                                                                        </li>
                                                                    ))
                                                                )}
                                                            </ul>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Bar - Wide */}
                        <div className="flex-1 max-w-3xl hidden md:block">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const query = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                                    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query)}`);
                                }}
                                className="relative"
                            >
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="Search for materials (e.g. bricks, timber, insulation)..."
                                    aria-label="Search for materials"
                                    className="w-full pl-10 pr-4 py-2.5 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-secondary-50 transition-shadow shadow-sm focus:shadow-md"
                                    suppressHydrationWarning
                                />
                                <button type="submit" aria-label="Submit search" className="absolute left-3 top-3 text-secondary-400 hover:text-primary-600" suppressHydrationWarning>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        {/* Desktop User Actions */}
                        <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
                            {/* Admin Link */}
                            {userProfile?.is_admin && (
                                <Link href="/admin" className="text-sm font-bold text-slate-900 bg-slate-100 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors border border-slate-200">
                                    Admin Panel
                                </Link>
                            )}

                            <Link href="/sell" className="btn-primary flex items-center gap-2 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                List Item
                            </Link>

                            {user ? (
                                <div className="flex items-center space-x-5">
                                    <NotificationBell userId={user.id} />
                                    <Link href="/messages" aria-label="Messages" className="text-secondary-600 hover:text-primary-600 transition relative p-1 group">
                                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link href="/favourites" aria-label="Favourites" className="text-secondary-600 hover:text-primary-600 transition p-1 group">
                                        <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </Link>
                                    <div className="relative group z-50">
                                        <Link href="/dashboard" aria-label="User Dashboard" className="w-9 h-9 rounded-full flex items-center justify-center border border-primary-200 hover:border-primary-400 transition-colors bg-primary-100 overflow-hidden relative">
                                            {avatarUrl ? (
                                                <img
                                                    src={avatarUrl}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-primary-700 font-bold">
                                                    {(userProfile?.full_name?.[0] || userProfile?.username?.[0] || user.email?.[0] || 'U').toUpperCase()}
                                                </span>
                                            )}
                                        </Link>

                                        {/* Dropdown with padding-top bridge for hover stability */}
                                        <div className="absolute right-0 top-full pt-2 w-56 hidden group-hover:block hover:block transform transition-all duration-200 origin-top-right">
                                            <div className="bg-white rounded-xl shadow-xl py-2 border border-secondary-100">
                                                <div className="px-4 py-3 border-b border-secondary-100 bg-secondary-50/50 rounded-t-xl">
                                                    <p className="text-xs text-secondary-500 uppercase tracking-wider font-semibold mb-1">Signed in as</p>
                                                    <p className="text-sm font-bold text-secondary-900 truncate">{user.email}</p>
                                                </div>
                                                <div className="py-2">
                                                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700">Dashboard</Link>
                                                    <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-secondary-700 hover:bg-primary-50 hover:text-primary-700">Settings</Link>
                                                </div>
                                                <div className="border-t border-secondary-100 py-2">
                                                    <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Sign out</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3 text-sm font-medium">
                                    <Link href="/auth/login" className="text-secondary-600 hover:text-primary-600 px-2 py-1">Log in</Link>
                                    <Link href="/auth/signup" className="btn-secondary px-4 py-2">Sign up</Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle mobile menu" className="md:hidden text-secondary-700 p-2 hover:bg-secondary-100 rounded-lg">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-white overflow-y-auto pt-20 pb-10 px-4 animate-fade-in">
                    <div className="space-y-6">
                        {/* Mobile Search */}
                        <div className="relative">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const query = (e.currentTarget.elements.namedItem('q') as HTMLInputElement).value;
                                    if (query.trim()) {
                                        router.push(`/search?q=${encodeURIComponent(query)}`);
                                        setIsMenuOpen(false);
                                    }
                                }}
                            >
                                <input name="q" type="text" placeholder="Search..." aria-label="Search" className="w-full pl-10 pr-4 py-3 border border-secondary-300 rounded-xl text-base bg-secondary-50" suppressHydrationWarning />
                                <button type="submit" aria-label="Submit search" className="absolute left-3 top-3.5 text-secondary-400" suppressHydrationWarning>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        </div>

                        {/* Mobile Actions */}
                        <Link href="/how-it-works" className="block text-center w-full text-secondary-700 font-medium py-3 border border-secondary-200 rounded-lg mb-3">
                            How it Works
                        </Link>
                        <Link href="/sell" className="btn-primary block text-center w-full text-lg py-3 shadow-sm">
                            List an Item
                        </Link>

                        {!user && (
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/auth/login" className="btn-outline text-center py-3">Log in</Link>
                                <Link href="/auth/signup" className="btn-secondary text-center py-3">Sign up</Link>
                            </div>
                        )}

                        {/* Mobile Categories Accordion */}
                        <div>
                            <h3 className="font-bold text-secondary-900 mb-4 px-2 text-lg">Categories</h3>
                            <div className="space-y-2">
                                {navCategories.map((cat) => (
                                    <div key={cat.id} className="border border-secondary-100 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => setActiveCategory(activeCategory?.id === cat.id ? null : cat)}
                                            className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${activeCategory?.id === cat.id ? 'bg-secondary-50 text-primary-700 font-bold' : 'bg-white text-secondary-800'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{cat.icon}</span>
                                                <span className={`${activeCategory?.id === cat.id ? 'font-bold' : 'font-medium'}`}>{cat.name}</span>
                                            </div>
                                            <svg className={`w-5 h-5 text-secondary-400 transition-transform ${activeCategory?.id === cat.id ? 'rotate-180 text-primary-600' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>

                                        {/* Mobile L2 & L3 Content */}
                                        {activeCategory?.id === cat.id && (
                                            <div className="bg-secondary-50/50 border-t border-secondary-100 p-4 space-y-4">
                                                <Link href={`/category/${cat.slug}`} className="block text-primary-600 font-bold text-sm">
                                                    View all {cat.name}
                                                </Link>
                                                {cat.subcategories.map((sub: SubCategory) => (
                                                    <div key={sub.id} className="ml-2">
                                                        <Link
                                                            href={`/category/${cat.slug}?subcategory=${sub.slug}`}
                                                            className="block font-semibold text-secondary-800 text-sm mb-1"
                                                            onClick={() => setIsMenuOpen(false)}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                        {sub.sub_subcategories && sub.sub_subcategories.length > 0 && (
                                                            <div className="pl-3 border-l-2 border-secondary-200 ml-1 mt-1 space-y-1">
                                                                {sub.sub_subcategories.map((subSub: SubSubCategory) => (
                                                                    <Link
                                                                        key={subSub.id}
                                                                        href={`/category/${cat.slug}?subcategory=${sub.slug}&detail=${subSub.slug}`}
                                                                        className="block text-secondary-500 text-xs py-1 hover:text-primary-600"
                                                                        onClick={() => setIsMenuOpen(false)}
                                                                    >
                                                                        {subSub.name}
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile User Links */}
                        {user && (
                            <div className="pt-6 border-t border-secondary-100">
                                <h3 className="font-bold text-secondary-900 mb-4 px-2 text-lg">My Account</h3>
                                <div className="space-y-1">
                                    <Link href="/dashboard" className="block px-4 py-3 text-secondary-700 hover:bg-primary-50 rounded-lg font-medium">Dashboard</Link>
                                    <Link href="/messages" className="flex items-center justify-between px-4 py-3 text-secondary-700 hover:bg-primary-50 rounded-lg font-medium">
                                        Messages
                                        {unreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount}</span>}
                                    </Link>
                                    <Link href="/favourites" className="block px-4 py-3 text-secondary-700 hover:bg-primary-50 rounded-lg font-medium">Favourites</Link>
                                    <Link href="/dashboard/settings" className="block px-4 py-3 text-secondary-700 hover:bg-primary-50 rounded-lg font-medium">Settings</Link>
                                    <button onClick={handleSignOut} className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium">Sign Out</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
