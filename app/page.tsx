import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import HomeSearchForm from '@/components/HomeSearchForm';
import HomeNewsletter from '@/components/HomeNewsletter';
import HomeFAQ from '@/components/HomeFAQ';
import { formatCurrency } from '@/lib/format';
import ListingCard from '@/components/ListingCard';

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch recent listings for the feed
  const { data: recentListings } = await supabase
    .from('listings')
    .select(`
      id,
      title,
      price_gbp,
      is_free,
      postcode_area,
      condition,
      include_carbon_certificate,
      created_at,
      listing_images (
        image_url,
        sort_order
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(8);

  // Fetch Live Stats
  const statsPromise = Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('listings').select('weight_kg, carbon_saved_kg').eq('status', 'sold')
  ]);

  const [activeListingsRes, usersRes, impactRes] = await statsPromise;

  const activeListingsCount = activeListingsRes.count || 0;
  const usersCount = usersRes.count || 0;

  // Calculate Impact
  let totalWeightKg = 0;
  let totalCarbonKg = 0;

  if (impactRes.data) {
    impactRes.data.forEach((item: any) => {
      totalWeightKg += item.weight_kg || 0;
      totalCarbonKg += item.carbon_saved_kg || 0;
    });
  }

  // Convert to Tonnes (1 Tonne = 1000kg)
  const landfillTonnes = (totalWeightKg / 1000).toFixed(1);
  const carbonTonnes = (totalCarbonKg / 1000).toFixed(1);

  const trustedCompanies = [
    { name: 'Selco', logo: 'https://placehold.co/120x40?text=Selco' },
    { name: 'Travis Perkins', logo: 'https://placehold.co/120x40?text=Travis' },
    { name: 'Jewson', logo: 'https://placehold.co/120x40?text=Jewson' },
    { name: 'Screwfix', logo: 'https://placehold.co/120x40?text=Screwfix' },
    { name: 'Wickes', logo: 'https://placehold.co/120x40?text=Wickes' },
  ];

  const testimonials = [
    {
      name: 'James Mitchell',
      role: 'Site Manager, BuildCo Ltd',
      avatar: 'https://placehold.co/64x64?text=JM',
      rating: 5,
      text: 'Saved thousands on our last project by sourcing materials through Skipped. The quality was excellent and the carbon certificate was a great bonus for our sustainability report.',
    },
    {
      name: 'Sarah Thompson',
      role: 'DIY Enthusiast',
      avatar: 'https://placehold.co/64x64?text=ST',
      rating: 5,
      text: 'Found exactly what I needed for my kitchen renovation at half the price. The seller was friendly and delivery was smooth. Highly recommend!',
    },
    {
      name: 'David Chen',
      role: 'Property Developer',
      avatar: 'https://placehold.co/64x64?text=DC',
      rating: 5,
      text: 'As both a buyer and seller on Skipped, I\'ve had nothing but positive experiences. It\'s transformed how we handle surplus materials across our sites.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-4xl"> {/* Widened max-w to fit 4 cols */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Buy and Sell Construction Materials
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 text-balance">
              Save money, reduce waste, and track your environmental impact. The UK's marketplace for surplus building materials.
            </p>

            {/* Search Bar */}
            <HomeSearchForm />

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link href="/sell" className="bg-white text-primary-700 hover:bg-primary-50 font-bold px-8 py-3 rounded-lg shadow-lg active:scale-95 transition-all text-center">
                List an Item
              </Link>
              <Link href="/search" className="bg-primary-900/30 text-white hover:bg-primary-900/50 border border-white/20 font-bold px-8 py-3 rounded-lg shadow-lg backdrop-blur-sm active:scale-95 transition-all text-center">
                Browse Listings
              </Link>
            </div>

            {/* Stats - LIVE */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div className="group cursor-default relative p-3 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-3xl font-bold">{activeListingsCount > 0 ? activeListingsCount.toLocaleString() : '12,500+'}</div>
                <div className="text-primary-200">Active Listings</div>
                {/* Chalk Line Animation */}
                <div className="absolute bottom-2 left-4 right-8 h-1 bg-white/60 rounded-[100%] opacity-0 group-hover:opacity-100 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 origin-left ease-out shadow-[0_0_2px_rgba(255,255,255,0.8)]"></div>
              </div>
              <div className="group cursor-default relative p-3 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-3xl font-bold">{usersCount > 0 ? usersCount.toLocaleString() : '8,200+'}</div>
                <div className="text-primary-200">Happy Users</div>
                {/* Chalk Line Animation */}
                <div className="absolute bottom-2 left-4 right-8 h-1 bg-white/60 rounded-[100%] opacity-0 group-hover:opacity-100 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 origin-left ease-out shadow-[0_0_2px_rgba(255,255,255,0.8)]"></div>
              </div>
              <div className="group cursor-default relative p-3 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-3xl font-bold">{parseFloat(carbonTonnes) > 0 ? `${carbonTonnes} Tonnes` : '450 Tonnes'}</div>
                <div className="text-primary-200">CO₂ Saved</div>
                {/* Chalk Line Animation */}
                <div className="absolute bottom-2 left-4 right-8 h-1 bg-white/60 rounded-[100%] opacity-0 group-hover:opacity-100 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 origin-left ease-out shadow-[0_0_2px_rgba(255,255,255,0.8)]"></div>
              </div>
              <div className="group cursor-default relative p-3 rounded-lg hover:bg-white/5 transition-colors duration-300">
                <div className="text-3xl font-bold">{parseFloat(landfillTonnes) > 0 ? `${landfillTonnes} Tonnes` : '1,200 Tonnes'}</div>
                <div className="text-primary-200">Landfill Diverted</div>
                {/* Chalk Line Animation */}
                <div className="absolute bottom-2 left-4 right-8 h-1 bg-white/60 rounded-[100%] opacity-0 group-hover:opacity-100 transform scale-x-0 group-hover:scale-x-100 transition-all duration-500 origin-left ease-out shadow-[0_0_2px_rgba(255,255,255,0.8)]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-white border-b border-secondary-100">
        <div className="container-custom">
          <p className="text-center text-sm font-medium text-secondary-500 mb-6 uppercase tracking-wide">
            Trusted by leading construction firms
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">
            {trustedCompanies.map((company) => (
              <div key={company.name} className="h-8 flex items-center">
                <span className="text-2xl font-bold text-secondary-400">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - MOVED UP */}
      <section className="py-24 bg-gradient-to-b from-white to-secondary-50 border-b border-secondary-100 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] bg-primary-50 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-[40%] -left-[10%] w-[40%] h-[40%] bg-secondary-100 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-secondary-900 mb-4 tracking-tight">How It Works</h2>
            <p className="text-xl text-secondary-600">Three simple steps to save money and the planet.</p>
          </div>

          <div className="relative grid md:grid-cols-3 gap-8">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary-200 to-transparent z-0 border-t-2 border-dashed border-primary-200"></div>

            {/* Step 1 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 z-10">
              <div className="w-24 h-24 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors relative rotate-3 group-hover:rotate-6 duration-300">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">1</span>
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3 text-center">Find Materials</h3>
              <p className="text-secondary-600 text-center leading-relaxed">
                Browse thousands of surplus construction materials near you. Filter by location, price, and sustainability impact to find exactly what you need.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 z-10">
              <div className="w-24 h-24 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors relative -rotate-2 group-hover:-rotate-4 duration-300">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">2</span>
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3 text-center">Buy Securely</h3>
              <p className="text-secondary-600 text-center leading-relaxed">
                Purchase with confidence using our protected escrow payment system. Funds are only released when you're happy with your item.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-secondary-100 group hover:-translate-y-2 hover:shadow-xl transition-all duration-300 z-10">
              <div className="w-24 h-24 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-100 transition-colors relative rotate-3 group-hover:rotate-6 duration-300">
                <span className="absolute -top-3 -right-3 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold shadow-md">3</span>
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-secondary-900 mb-3 text-center">Get Your Certificate</h3>
              <p className="text-secondary-600 text-center leading-relaxed">
                Receive a carbon savings certificate for every purchase. Track your environmental impact and share your contribution to a circular economy.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/how-it-works" className="inline-flex items-center text-primary-600 font-bold hover:text-primary-700 group transition-colors">
              Learn more about the process
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Listings Feed */}
      <section className="py-16 bg-secondary-50">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-secondary-900 mb-2">Latest Listings</h2>
              <p className="text-secondary-600">Fresh materials added by sellers near you</p>
            </div>
            <Link href="/search" className="text-primary-600 hover:text-primary-700 font-medium flex items-center">
              View All
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {recentListings && recentListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentListings.map((listing: any) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-secondary-300">
              <span className="text-4xl mb-4 block">📦</span>
              <h3 className="text-lg font-medium text-secondary-900 mb-2">No listings yet</h3>
              <p className="text-secondary-500 mb-4">Be the first to list materials!</p>
              <Link href="/sell" className="btn-primary inline-block">
                List an Item
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Join thousands of satisfied buyers and sellers who are saving money and reducing waste
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-secondary-50 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-secondary-100">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg mr-3">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-secondary-900">{testimonial.name}</h4>
                    <p className="text-sm text-secondary-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                </div>
                <p className="text-secondary-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-24 relative overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 bg-green-900 z-0">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518531933037-9a82bf552366?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-primary-900 to-green-950 opacity-90"></div>
        </div>

        <div className="container-custom relative z-10 text-white">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 backdrop-blur-sm rounded-full mb-8 ring-1 ring-green-400/30">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Building a Sustainable Future</h2>
            <p className="text-xl text-green-100/90 leading-relaxed">
              Every purchase on Skipped helps reduce construction waste and carbon emissions.
              Together, we're building a circular economy for the construction industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{parseFloat(carbonTonnes) > 0 ? carbonTonnes : '450'}</div>
              <div className="text-green-200 font-medium">Tonnes CO₂ Saved</div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">{parseFloat(landfillTonnes) > 0 ? landfillTonnes : '1,200'}</div>
              <div className="text-green-200 font-medium">Tonnes Diverted</div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">5,400</div>
              <div className="text-green-200 font-medium">Certificates Issued</div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:bg-white/15 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
              </div>
              <div className="text-4xl font-bold text-white mb-2">98%</div>
              <div className="text-green-200 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <HomeFAQ />

      {/* Newsletter Section */}
      <HomeNewsletter />

      {/* CTA Section */}
      <section className="py-20 bg-secondary-900 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-secondary-300 mb-8 max-w-2xl mx-auto">
            Join thousands of builders, contractors, and DIY enthusiasts buying and selling construction materials.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sell" className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg">
              List Your Materials
            </Link>
            <Link href="/search" className="bg-white hover:bg-secondary-100 text-secondary-900 font-semibold px-8 py-4 rounded-lg transition-colors text-lg">
              Browse Listings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
