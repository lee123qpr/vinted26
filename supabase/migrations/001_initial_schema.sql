-- Skipped Construction Materials Marketplace Database Schema
-- UK English, Production-ready, No mock data

-- Enable UUID extension (Not needed for gen_random_uuid in PG13+)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  postcode_area TEXT, -- First part of postcode for privacy (e.g., "SW1A")
  is_trade_verified BOOLEAN DEFAULT FALSE,
  verification_documents JSONB,
  rating_average DECIMAL(3,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_purchases INTEGER DEFAULT 0,
  delivery_radius_miles INTEGER,
  offers_delivery BOOLEAN DEFAULT FALSE,
  offers_collection BOOLEAN DEFAULT TRUE,
  total_carbon_saved_kg DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CATEGORIES & SUBCATEGORIES
-- ============================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  embodied_carbon_kg_per_kg DECIMAL(6,3), -- For carbon calculations
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- ============================================================================
-- LISTINGS TABLE
-- ============================================================================
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  subcategory_id UUID REFERENCES subcategories(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('new_unused', 'like_new', 'good', 'fair', 'for_parts')),
  brand TEXT,
  quantity_available INTEGER NOT NULL DEFAULT 1,
  dimensions_length_cm DECIMAL(10,2),
  dimensions_width_cm DECIMAL(10,2),
  dimensions_height_cm DECIMAL(10,2),
  weight_kg DECIMAL(10,2),
  price_gbp DECIMAL(10,2) NOT NULL,
  offers_collection BOOLEAN DEFAULT TRUE,
  offers_delivery BOOLEAN DEFAULT FALSE,
  delivery_radius_miles INTEGER,
  delivery_charge_gbp DECIMAL(10,2),
  delivery_charge_type TEXT CHECK (delivery_charge_type IN ('flat_rate', 'per_mile')),
  location_lat DECIMAL(10,7),
  location_lng DECIMAL(10,7),
  postcode_area TEXT,
  full_address TEXT, -- Encrypted, only shown after purchase
  include_carbon_certificate BOOLEAN DEFAULT FALSE,
  carbon_saved_kg DECIMAL(10,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed', 'flagged')),
  view_count INTEGER DEFAULT 0,
  favourite_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- LISTING IMAGES
-- ============================================================================
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  buyer_id UUID REFERENCES profiles(id),
  seller_id UUID REFERENCES profiles(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price_gbp DECIMAL(10,2) NOT NULL,
  platform_fee_gbp DECIMAL(10,2) NOT NULL,
  delivery_fee_gbp DECIMAL(10,2) DEFAULT 0,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('collection', 'delivery')),
  delivery_address TEXT,
  collection_address TEXT,
  delivery_date DATE,
  collection_date DATE,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'held_in_escrow', 'released', 'refunded')),
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'collected', 'delivered', 'completed', 'disputed', 'cancelled')),
  carbon_certificate_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id),
  transaction_id UUID REFERENCES transactions(id),
  sender_id UUID REFERENCES profiles(id),
  recipient_id UUID REFERENCES profiles(id),
  message_text TEXT NOT NULL,
  image_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CARBON CERTIFICATES TABLE
-- ============================================================================
CREATE TABLE carbon_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  certificate_number TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  material_type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  weight_kg DECIMAL(10,2) NOT NULL,
  carbon_saved_kg DECIMAL(10,2) NOT NULL,
  landfill_diverted_kg DECIMAL(10,2) NOT NULL,
  buyer_name TEXT,
  seller_name TEXT,
  show_names BOOLEAN DEFAULT TRUE,
  pdf_url TEXT,
  qr_code_data TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- REVIEWS TABLE
-- ============================================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  reviewer_id UUID REFERENCES profiles(id),
  reviewee_id UUID REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  delivery_experience_rating INTEGER CHECK (delivery_experience_rating >= 1 AND delivery_experience_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DISPUTES TABLE
-- ============================================================================
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id),
  opened_by_id UUID REFERENCES profiles(id),
  issue_type TEXT NOT NULL CHECK (issue_type IN ('not_as_described', 'damaged', 'incorrect_dimensions', 'safety_concerns', 'delivery_issues', 'quantity_issues')),
  description TEXT NOT NULL,
  evidence_urls TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved')),
  resolution TEXT,
  resolved_by_admin_id UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ADMIN LOGS TABLE
-- ============================================================================
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES profiles(id),
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MATERIAL CARBON VALUES TABLE
-- ============================================================================
CREATE TABLE material_carbon_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_name TEXT NOT NULL,
  category TEXT,
  subcategory TEXT,
  embodied_carbon_kg_per_kg DECIMAL(6,3) NOT NULL,
  source TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FAVOURITES TABLE
-- ============================================================================
CREATE TABLE favourites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_listings_seller ON listings(seller_id);
CREATE INDEX idx_listings_category ON listings(category_id);
CREATE INDEX idx_listings_subcategory ON listings(subcategory_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_location ON listings(location_lat, location_lng);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE carbon_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all profiles, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Listings: Public read, sellers can manage their own
CREATE POLICY "Listings are viewable by everyone" ON listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY "Users can create listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete own listings" ON listings
  FOR DELETE USING (auth.uid() = seller_id);

-- Listing Images: Follow listing permissions
CREATE POLICY "Listing images are viewable by everyone" ON listing_images
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own listing images" ON listing_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
      AND listings.seller_id = auth.uid()
    )
  );

-- Transactions: Only buyer and seller can view
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create transactions" ON transactions
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update own transactions" ON transactions
  FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Messages: Only sender and recipient can view
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Carbon Certificates: Public if is_public, otherwise only buyer/seller
CREATE POLICY "Public certificates are viewable by everyone" ON carbon_certificates
  FOR SELECT USING (
    is_public = true OR
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = carbon_certificates.transaction_id
      AND (transactions.buyer_id = auth.uid() OR transactions.seller_id = auth.uid())
    )
  );

-- Reviews: Public read
CREATE POLICY "Reviews are viewable by everyone" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their transactions" ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = reviews.transaction_id
      AND (transactions.buyer_id = auth.uid() OR transactions.seller_id = auth.uid())
    )
  );

-- Disputes: Only involved parties can view
CREATE POLICY "Users can view own disputes" ON disputes
  FOR SELECT USING (
    auth.uid() = opened_by_id OR
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = disputes.transaction_id
      AND (transactions.buyer_id = auth.uid() OR transactions.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can create disputes for their transactions" ON disputes
  FOR INSERT WITH CHECK (
    auth.uid() = opened_by_id AND
    EXISTS (
      SELECT 1 FROM transactions
      WHERE transactions.id = disputes.transaction_id
      AND (transactions.buyer_id = auth.uid() OR transactions.seller_id = auth.uid())
    )
  );

-- Favourites: Users can manage their own
CREATE POLICY "Users can view own favourites" ON favourites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create favourites" ON favourites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favourites" ON favourites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update seller rating when review is created
CREATE OR REPLACE FUNCTION update_seller_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET rating_average = (
    SELECT AVG(rating)
    FROM reviews
    WHERE reviewee_id = NEW.reviewee_id
  )
  WHERE id = NEW.reviewee_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_on_review AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_seller_rating();

-- Increment view count
CREATE OR REPLACE FUNCTION increment_listing_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE listings
  SET view_count = view_count + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
