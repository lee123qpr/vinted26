import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { headers } from "next/headers";
import GlobalBanner from "@/components/GlobalBanner";
import { createClient } from "@/lib/supabase/server";
import { GoogleAnalytics } from '@next/third-parties/google';
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: '%s | Skipped',
    default: 'Skipped - Construction Materials Marketplace'
  },
  description: "Buy and sell surplus construction materials. Save money, reduce waste, and track your environmental impact.",
  metadataBase: new URL('https://www.skipped-uk.com'),
  openGraph: {
    title: 'Skipped - Construction Materials Marketplace',
    description: 'Buy and sell surplus construction materials. Save money, reduce waste, and track your environmental impact.',
    url: 'https://www.skipped-uk.com',
    siteName: 'Skipped',
    locale: 'en_GB',
    type: 'website',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  // Fetch System Settings
  const { data: settingsRaw } = await supabase.from('system_settings').select('*');
  const settings = settingsRaw || [];

  const maintenanceMode = settings.find(s => s.key === 'maintenance_mode');
  const bannerText = settings.find(s => s.key === 'global_banner_text');

  // Fetch user for Navigation and Maintenance check
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Categories for Navigation (Server Side)
  const { data: categoriesRaw } = await supabase
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

  const categories = categoriesRaw || [];

  // Maintenance Mode Logic
  // Skip check for Admin paths and Auth paths (login/signup) and API routes
  if (maintenanceMode?.is_active && !pathname.startsWith('/admin') && !pathname.startsWith('/auth') && !pathname.startsWith('/api') && pathname !== '/favicon.ico') {
    // Only check profile if user exists, to see if admin
    let isAdmin = false;
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      isAdmin = profile?.role === 'admin';
    }

    if (!isAdmin) {
      return (
        <html lang="en-GB">
          <body className={inter.className}>
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4 text-center">
              <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
                <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                </div>
                <h1 className="text-2xl font-black mb-2 text-slate-800">Under Maintenance</h1>
                <p className="text-slate-500 mb-6 leading-relaxed">
                  we&apos;re currently upgrading our platform to serve you better. We'll be back shortly.
                </p>
                <div className="text-xs font-mono text-slate-400">Error Code: 503</div>
              </div>
            </div>
          </body>
        </html>
      );
    }
  }

  return (
    <html lang="en-GB" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <GlobalBanner text={bannerText?.is_active ? bannerText.value : null} />
        <Navigation user={user} categories={categories} />
        {/* Waiting for next step to implement full fetch logic properly */}
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <CookieConsent />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  );
}
