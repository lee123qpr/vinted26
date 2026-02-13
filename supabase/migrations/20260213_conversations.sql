-- 1. Create Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID REFERENCES public.listings(id),
    participant1_id UUID REFERENCES public.profiles(id) NOT NULL,
    participant2_id UUID REFERENCES public.profiles(id) NOT NULL,
    last_message_id UUID REFERENCES public.messages(id),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure uniqueness: A conversation is defined by the listing and the two participants.
    -- We force participant1_id < participant2_id logic in the application (or via trigger), 
    -- but for simplicity in unique constraint, we just rely on the app to sort IDs.
    -- BETTER: A unique constraint that doesn't care about order is hard in standard SQL unique index without a function index.
    -- We will settle for: (listing_id, participant1_id, participant2_id) assuming sorted insertion.
    UNIQUE(listing_id, participant1_id, participant2_id)
);

-- 2. Enable RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Users can see conversations they are part of.
CREATE POLICY "Users can view their conversations"
ON public.conversations
FOR SELECT
USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
);

-- Users can insert conversations if they are part of it.
CREATE POLICY "Users can insert conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
);

-- Users can update conversations if they are part of it (e.g. to update last_message)
CREATE POLICY "Users can update their conversations"
ON public.conversations
FOR UPDATE
USING (
    auth.uid() = participant1_id OR auth.uid() = participant2_id
);

-- 4. Indexes for Performance
CREATE INDEX idx_conversations_p1 ON public.conversations(participant1_id);
CREATE INDEX idx_conversations_p2 ON public.conversations(participant2_id);
CREATE INDEX idx_conversations_updated ON public.conversations(updated_at DESC);

-- 5. Backfill Function
-- This function will scan the messages table and populate conversations.
CREATE OR REPLACE FUNCTION backfill_conversations()
RETURNS void AS $$
DECLARE
    r RECORD;
    p1 UUID;
    p2 UUID;
    conv_id UUID;
BEGIN
    -- Iterate over distinct conversation groups from messages
    FOR r IN 
        SELECT DISTINCT 
            listing_id, 
            LEAST(sender_id, recipient_id) as u1, 
            GREATEST(sender_id, recipient_id) as u2
        FROM public.messages
    LOOP
        p1 := r.u1;
        p2 := r.u2;
        
        -- Insert conversation if not exists
        INSERT INTO public.conversations (listing_id, participant1_id, participant2_id)
        VALUES (r.listing_id, p1, p2)
        ON CONFLICT (listing_id, participant1_id, participant2_id) DO NOTHING
        RETURNING id INTO conv_id;
        
        -- If it existed, get the ID
        IF conv_id IS NULL THEN
            SELECT id INTO conv_id FROM public.conversations 
            WHERE listing_id IS NOT DISTINCT FROM r.listing_id 
            AND participant1_id = p1 
            AND participant2_id = p2;
        END IF;
        
        -- Update last_message_id for this conversation
        UPDATE public.conversations
        SET 
            last_message_id = (
                SELECT id FROM public.messages 
                WHERE listing_id IS NOT DISTINCT FROM r.listing_id 
                AND ((sender_id = p1 AND recipient_id = p2) OR (sender_id = p2 AND recipient_id = p1))
                ORDER BY created_at DESC 
                LIMIT 1
            ),
            updated_at = (
                SELECT created_at FROM public.messages 
                WHERE listing_id IS NOT DISTINCT FROM r.listing_id 
                AND ((sender_id = p1 AND recipient_id = p2) OR (sender_id = p2 AND recipient_id = p1))
                ORDER BY created_at DESC 
                LIMIT 1
            )
        WHERE id = conv_id;
        
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger to keep it updated (Automatic Scalability!)
-- Whenever a new message is inserted, update or create the conversation.
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
DECLARE
    p1 UUID;
    p2 UUID;
BEGIN
    p1 := LEAST(NEW.sender_id, NEW.recipient_id);
    p2 := GREATEST(NEW.sender_id, NEW.recipient_id);
    
    INSERT INTO public.conversations (listing_id, participant1_id, participant2_id, last_message_id, updated_at)
    VALUES (NEW.listing_id, p1, p2, NEW.id, NEW.created_at)
    ON CONFLICT (listing_id, participant1_id, participant2_id) 
    DO UPDATE SET 
        last_message_id = NEW.id,
        updated_at = NEW.created_at;
        
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation
AFTER INSERT ON public.messages
FOR EACH ROW
EXECUTE FUNCTION update_conversation_on_message();
