import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/server';
import HomeSearchForm from '@/components/HomeSearchForm';
import HomeNewsletter from '@/components/HomeNewsletter';
import { formatCurrency } from '@/lib/format';

export default async function HomePage() {
  // Fetch recent listings for the feed
  const supabase = await createClient();
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

  const trustedCompanies = [
    { name: 'Selco', logo: '/logos/selco.svg' },
    { name: 'Travis Perkins', logo: '/logos/travis-perkins.svg' },
    { name: 'Jewson', logo: '/logos/jewson.svg' },
    { name: 'Screwfix', logo: '/logos/screwfix.svg' },
    { name: 'Wickes', logo: '/logos/wickes.svg' },
  ];

  const testimonials = [
    {
      name: 'James Mitchell',
      role: 'Site Manager, BuildCo Ltd',
      avatar: '/avatars/james.jpg',
      rating: 5,
      text: 'Saved thousands on our last project by sourcing materials through Skipped. The quality was excellent and the carbon certificate was a great bonus for our sustainability report.',
    },
    {
      name: 'Sarah Thompson',
      role: 'DIY Enthusiast',
      avatar: '/avatars/sarah.jpg',
      rating: 5,
      text: 'Found exactly what I needed for my kitchen renovation at half the price. The seller was friendly and delivery was smooth. Highly recommend!',
    },
    {
      name: 'David Chen',
      role: 'Property Developer',
      avatar: '/avatars/david.jpg',
      rating: 5,
      text: 'As both a buyer and seller on Skipped, I\'ve had nothing but positive experiences. It\'s transformed how we handle surplus materials across our sites.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
              Buy and Sell Construction Materials
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 text-balance">
              Save money, reduce waste, and track your environmental impact. The UK's marketplace for surplus building materials.
            </p>

            {/* Search Bar */}
            <HomeSearchForm />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <div className="text-3xl font-bold">12,500+</div>
                <div className="text-primary-200">Active Listings</div>
              </div>
              <div>
                <div className="text-3xl font-bold">8,200+</div>
                <div className="text-primary-200">Happy Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold">450 tonnes</div>
                <div className="text-primary-200">CO₂ Saved</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-white border-b border-secondary-100">
        <div className="container-custom">
          <p className="text-center text-sm font-medium text-secondary-500 mb-6 uppercase tracking-wide">
            Trusted by leading construction suppliers
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
                <Link
                  key={listing.id}
                  href={`/listing/${listing.id}`}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                >
                  <div className="relative aspect-square bg-secondary-100">
                    {listing.listing_images?.[0]?.image_url ? (
                      <Image
                        src={listing.listing_images[0].image_url}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-secondary-400">
                        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {listing.include_carbon_certificate && (
                      <div className="absolute top-2 left-2 bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center shadow-sm border border-green-200 z-10">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Cert
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-secondary-600 capitalize">
                      {listing.condition?.replace('_', ' ')}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className={`text-lg font-bold ${listing.is_free ? 'text-green-600' : 'text-primary-700'}`}>
                        {listing.is_free ? 'FREE' : formatCurrency(listing.price_gbp)}
                      </span>
                      <span className="text-xs text-secondary-500">{listing.postcode_area}</span>
                    </div>
                  </div>
                </Link>
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

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-secondary-900 mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Find Materials</h3>
              <p className="text-secondary-600">
                Browse thousands of surplus construction materials near you. Filter by location, price, and sustainability impact.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Buy Securely</h3>
              <p className="text-secondary-600">
                Purchase with confidence using our escrow payment system. Choose collection or delivery options.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Get Your Certificate</h3>
              <p className="text-secondary-600">
                Receive a carbon savings certificate showing your environmental impact. Share your contribution to sustainability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-secondary-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">What Our Users Say</h2>
            <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
              Join thousands of satisfied buyers and sellers who are saving money and reducing waste
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
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
      <section className="py-16 bg-gradient-to-br from-green-50 to-primary-50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-secondary-900 mb-4">Building a Sustainable Future</h2>
            <p className="text-lg text-secondary-700 mb-8">
              Every purchase on Skipped helps reduce construction waste and carbon emissions. Track your environmental impact with verified carbon savings certificates.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-green-600">450</div>
                <div className="text-sm text-secondary-600">Tonnes CO₂ Saved</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-green-600">1,200</div>
                <div className="text-sm text-secondary-600">Tonnes Diverted</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-green-600">5,400</div>
                <div className="text-sm text-secondary-600">Certificates Issued</div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="text-2xl font-bold text-green-600">98%</div>
                <div className="text-sm text-secondary-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
