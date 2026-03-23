-- Fix: The trigger function that updates/creates a conversation row when a message is sent
-- was failing because it runs within the caller's RLS context, and the conversations INSERT
-- requires auth.uid() = participant1_id OR participant2_id - which the trigger can't satisfy
-- when called implicitly.
-- Solution: Recreate the function as SECURITY DEFINER so it runs as the function owner
-- (bypassing RLS) and set search_path = public for security.

CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
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

-- Also fix backfill_conversations for consistency
CREATE OR REPLACE FUNCTION backfill_conversations()
RETURNS void 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r RECORD;
    p1 UUID;
    p2 UUID;
    conv_id UUID;
BEGIN
    FOR r IN 
        SELECT DISTINCT 
            listing_id, 
            LEAST(sender_id, recipient_id) as u1, 
            GREATEST(sender_id, recipient_id) as u2
        FROM public.messages
    LOOP
        p1 := r.u1;
        p2 := r.u2;
        
        INSERT INTO public.conversations (listing_id, participant1_id, participant2_id)
        VALUES (r.listing_id, p1, p2)
        ON CONFLICT (listing_id, participant1_id, participant2_id) DO NOTHING
        RETURNING id INTO conv_id;
        
        IF conv_id IS NULL THEN
            SELECT id INTO conv_id FROM public.conversations 
            WHERE listing_id IS NOT DISTINCT FROM r.listing_id 
            AND participant1_id = p1 
            AND participant2_id = p2;
        END IF;
        
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
