-- Migration 012: Add "List for Free" and "Collection Notes" options
-- Adds flexibility for sellers to give items away and specify logistics.

DO $$
BEGIN
    -- Add is_free column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='is_free') THEN
        ALTER TABLE listings ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add collection_notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='listings' AND column_name='collection_notes') THEN
        ALTER TABLE listings ADD COLUMN collection_notes TEXT;
    END IF;
END $$;
