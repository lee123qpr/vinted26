'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createNotification } from './notifications';

export async function createOffer(listingId: string, amount: number) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { error: 'You must be logged in to make an offer.' };
        }

        if (!listingId || !amount || amount <= 0) {
            return { error: 'Invalid offer details.' };
        }

        // 1. Check for EXISTING ACTIVE offer (One at a time rule)
        const { data: activeOffer, error: activeError } = await supabase
            .from('offers')
            .select('id')
            .eq('listing_id', listingId)
            .eq('buyer_id', user.id)
            .in('status', ['pending', 'countered'])
            .maybeSingle();

        if (activeError) throw new Error(activeError.message);
        if (activeOffer) {
            return { error: 'You already have a pending offer on this item. Please wait for a response.' };
        }

        // 2. Check TOTAL attempts limit (Max 5 chances)
        const { count: totalAttempts, error: countError } = await supabase
            .from('offers')
            .select('*', { count: 'exact', head: true })
            .eq('listing_id', listingId)
            .eq('buyer_id', user.id);

        if (countError) throw new Error(countError.message);
        if (totalAttempts !== null && totalAttempts >= 5) {
            return { error: 'Maximum offer limit (5) reached for this item.' };
        }

        // 3. Create Offer
        const { data: offer, error: insertError } = await supabase
            .from('offers')
            .insert({
                listing_id: listingId,
                buyer_id: user.id,
                amount_gbp: amount,
                status: 'pending'
            })
            .select()
            .single();

        if (insertError) throw new Error(insertError.message);

        // Notify Seller
        // We look up the listing again? No, we need seller_id. We can fetch it or pass it?
        // Optimally, fetch it to be safe.
        const { data: listingData } = await supabase.from('listings').select('seller_id, title').eq('id', listingId).single();
        if (listingData && listingData.seller_id) {
            const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();

            await createNotification({
                userId: listingData.seller_id,
                type: 'offer_received',
                resourceId: offer.id,
                data: {
                    listingId: listingId,
                    listingTitle: listingData.title,
                    listingImage: null,
                    offerAmount: amount,
                    counterpartUsername: profile?.username || 'Some user',
                    counterpartId: user.id
                }
            });
        }

        revalidatePath(`/listing/${listingId}`);
        return { success: true, offer };

    } catch (err: any) {
        console.error('Create Offer Action Error:', err);
        return { error: err.message || 'Failed to send offer.' };
    }
}

export async function updateOfferStatus(offerId: string, status: 'accepted' | 'rejected') {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Unauthorized' };
        }

        // Verify ownership (User must be the seller of the listing for this offer)
        // We can do this via RLS or explicit check. Explicit check is safer for logic.
        const { data: offer, error: fetchError } = await supabase
            .from('offers')
            .select('*, listings(seller_id, title)')
            .eq('id', offerId)
            .single();

        if (fetchError || !offer) {
            return { error: 'Offer not found.' };
        }

        // Check permissions and state
        const isSeller = offer.listings.seller_id === user.id;
        const isBuyer = offer.buyer_id === user.id;

        if (!isSeller && !isBuyer) {
            return { error: 'You do not have permission to update this offer.' };
        }

        // Validate state transitions based on role
        if (isSeller) {
            if (offer.status !== 'pending') {
                return { error: 'This offer is not awaiting your response.' };
            }
        } else if (isBuyer) {
            if (offer.status !== 'countered') {
                return { error: 'This offer is not awaiting your response.' };
            }
        }

        // Update status using Admin Client
        const adminSupabase = await createAdminClient();
        const { error: updateError } = await adminSupabase
            .from('offers')
            .update({ status })
            .eq('id', offerId);

        if (updateError) throw updateError;

        // Notify the OTHER party
        const targetUserId = isSeller ? offer.buyer_id : offer.listings.seller_id;
        const actorName = isSeller
            ? (offer.listings.profiles?.username || 'Seller')
            : (offer.buyer_id === user.id ? 'Buyer' : 'User'); // We need buyer profile? offer doesn't join buyer profile in select above properly maybe?

        // We need to fetch buyer profile name if we want to be precise, or just use generic.
        // Let's rely on what we have. We selected '*, listings(seller_id)'... 
        // We should probably select buyer profile too or fetch it.
        const { data: actorProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();

        await createNotification({
            userId: targetUserId,
            type: status === 'accepted' ? 'offer_accepted' : 'offer_rejected',
            resourceId: offer.id,
            data: {
                listingId: offer.listing_id,
                listingTitle: offer.listings?.title || 'an item',
                listingImage: null,
                offerAmount: offer.counter_amount_gbp || offer.amount_gbp,
                counterpartUsername: actorProfile?.username || 'User',
                counterpartId: user.id
            }
        });

        revalidatePath('/dashboard/offers');
        return { success: true };

    } catch (err: any) {
        console.error('Update Offer Error:', err);
        return { error: err.message || 'Failed to update offer.' };
    }
}

export async function counterOffer(offerId: string, amount: number) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'Unauthorized' };
        }

        if (!amount || amount <= 0) {
            return { error: 'Invalid amount.' };
        }

        // Verify ownership
        const { data: offer, error: fetchError } = await supabase
            .from('offers')
            .select('*, listings(seller_id, title)')
            .eq('id', offerId)
            .single();

        if (fetchError || !offer) {
            return { error: 'Offer not found.' };
        }

        if (fetchError || !offer) {
            return { error: 'Offer not found.' };
        }

        const isSeller = offer.listings.seller_id === user.id;
        const isBuyer = offer.buyer_id === user.id;

        if (!isSeller && !isBuyer) {
            return { error: 'You are not involved in this offer.' };
        }

        let updateData: any = {
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        if (isSeller) {
            // Seller countering (Pending -> Countered)
            if (offer.status !== 'pending') {
                // Allow re-countering? Assuming yes for negotiation flow, or strict state machine.
                // User wants "Counter the Counter", implying Ping Pong.
                // Standard flow: Pending(Buyer) -> Countered(Seller) -> Pending(Buyer) ...
                if (offer.status !== 'pending' && offer.status !== 'countered') { // Allow countering a counter? No, usually you wait.
                    // Actually, if status is pending, it's Seller's turn.
                    // If status is countered, it's Buyer's turn.
                }
            }

            // Strict check: Seller can only act if status is Pending (waiting for seller)
            // But if we want to allow editing a counter? Let's stick to turn-taking.
            if (offer.status === 'countered') {
                return { error: 'Waiting for buyer response.' };
            }

            updateData.status = 'countered';
            updateData.counter_amount_gbp = amount;

        } else if (isBuyer) {
            // Buyer countering (Countered -> Pending)
            if (offer.status !== 'countered') {
                return { error: 'Waiting for seller response.' };
            }

            updateData.status = 'pending';
            // Update counter amount to the BUYER'S new counter price.
            // We keep amount_gbp as the ORIGINAL offer amount for reference.
            updateData.counter_amount_gbp = amount;
        }

        // Use Admin Client to bypass RLS for the update
        const adminSupabase = await createAdminClient();
        const { error: updateError } = await adminSupabase
            .from('offers')
            .update(updateData)
            .eq('id', offerId);

        if (updateError) {
            console.error('Update Error (Admin):', updateError);
            throw updateError;
        }

        // Notify Target
        const targetUserId = isSeller ? offer.buyer_id : offer.listings.seller_id;
        const { data: actorProfile } = await supabase.from('profiles').select('username').eq('id', user.id).single();

        await createNotification({
            userId: targetUserId,
            type: 'offer_countered',
            resourceId: offer.id,
            data: {
                listingId: offer.listing_id,
                listingTitle: offer.listings?.title || 'an item',
                listingImage: null,
                offerAmount: amount, // The NEW counter amount
                counterpartUsername: actorProfile?.username || 'User',
                counterpartId: user.id
            }
        });

        revalidatePath('/dashboard/offers/received');
        revalidatePath('/dashboard/offers/sent');
        return { success: true };

    } catch (err: any) {
        console.error('Counter Offer Error:', err);
        return { error: err.message || 'Failed to counter offer.' };
    }
}

