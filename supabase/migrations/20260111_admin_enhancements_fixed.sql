-- Admin Enhancements Migration (Idempotent Version)
-- This version can be run multiple times safely

-- ============================================================================
-- USER SUSPENSION SUPPORT
-- ============================================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'warned', 'banned'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_end_date TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

-- ============================================================================
-- DISPUTE ENHANCEMENTS
-- ============================================================================
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS resolution_type TEXT CHECK (resolution_type IN ('full_refund', 'partial_refund', 'release_to_seller', 'dismissed'));
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS refund_amount_gbp DECIMAL(10,2);

-- ============================================================================
-- DISPUTE MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  message_text TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- DISPUTE EVIDENCE TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID REFERENCES disputes(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES profiles(id),
  evidence_url TEXT NOT NULL,
  evidence_type TEXT CHECK (evidence_type IN ('image', 'document')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_suspension_end ON profiles(suspension_end_date);
CREATE INDEX IF NOT EXISTS idx_dispute_messages_dispute ON dispute_messages(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute ON dispute_evidence(dispute_id);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running)
DROP POLICY IF EXISTS "Users can view dispute messages" ON dispute_messages;
DROP POLICY IF EXISTS "Users can send dispute messages" ON dispute_messages;
DROP POLICY IF EXISTS "Users can view dispute evidence" ON dispute_evidence;
DROP POLICY IF EXISTS "Users can upload dispute evidence" ON dispute_evidence;

-- Recreate policies
CREATE POLICY "Users can view dispute messages" ON dispute_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN transactions t ON d.transaction_id = t.id
      WHERE d.id = dispute_messages.dispute_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can send dispute messages" ON dispute_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN transactions t ON d.transaction_id = t.id
      WHERE d.id = dispute_messages.dispute_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can view dispute evidence" ON dispute_evidence
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN transactions t ON d.transaction_id = t.id
      WHERE d.id = dispute_evidence.dispute_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );

CREATE POLICY "Users can upload dispute evidence" ON dispute_evidence
  FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
      SELECT 1 FROM disputes d
      JOIN transactions t ON d.transaction_id = t.id
      WHERE d.id = dispute_evidence.dispute_id
      AND (t.buyer_id = auth.uid() OR t.seller_id = auth.uid())
    )
  );
