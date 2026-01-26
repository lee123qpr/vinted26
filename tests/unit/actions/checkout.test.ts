import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordSuccessfulPayment } from '@/app/actions/checkout';
import { createMockSupabase } from '../../utils/supabase-mock';

// Mock Next.js Cache/Navigation
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('next/navigation', () => ({ redirect: vi.fn() }));

// Mock Notifications
vi.mock('@/app/actions/notifications', () => ({
    createNotification: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock Stripe
const { mockStripe } = vi.hoisted(() => {
    return {
        mockStripe: {
            paymentIntents: {
                retrieve: vi.fn(),
            },
            refunds: {
                create: vi.fn(),
            }
        }
    };
});
vi.mock('@/lib/stripe', () => ({ stripe: mockStripe }));

// Mock Supabase
const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
    createAdminClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Checkout Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('recordSuccessfulPayment', () => {
        const validParams = {
            listingId: 'listing_1',
            paymentIntentId: 'pi_123',
            totalAmount: 100,
            platformFee: 5,
            deliveryFee: 10,
            deliveryMethod: 'delivery',
            deliveryAddress: '123 Fake St',
        };

        it('should return error if unauthorized', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error() });
            const result = await recordSuccessfulPayment(validParams);
            expect(result.error).toBe('Unauthorized');
        });

        it('should return error if payment intent is not succeeded', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'buyer_1' } }, error: null });
            mockStripe.paymentIntents.retrieve.mockResolvedValue({ status: 'requires_payment_method' });

            const result = await recordSuccessfulPayment(validParams);
            expect(result.error).toContain('not successful');
        });

        it('should handle race condition (listing sold) by refunding', async () => {
            // User Authorized
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'buyer_1' } }, error: null });
            // Payment Valid
            mockStripe.paymentIntents.retrieve.mockResolvedValue({ status: 'succeeded' });
            // Mock Refund
            mockStripe.refunds.create.mockResolvedValue({ id: 're_123' });

            // Listing Fetch -> Active? NO, SOLD.
            mockSupabase.select.mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: { id: 'listing_1', status: 'sold', seller_id: 'seller_1' },
                        error: null
                    })
                })
            });

            const result = await recordSuccessfulPayment(validParams);

            expect(mockStripe.refunds.create).toHaveBeenCalled();
            expect(result.error).toContain('automatically refunded');
        });

        it('should process successful payment correctly', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'buyer_1' } }, error: null });
            mockStripe.paymentIntents.retrieve.mockResolvedValue({ status: 'succeeded' });

            // Listing Fetch -> Active
            mockSupabase.select.mockReturnValueOnce({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: { id: 'listing_1', status: 'active', seller_id: 'seller_1', title: 'Brick' },
                        error: null
                    })
                })
            });

            // Mock System Settings for Fee (second select call)
            mockSupabase.select.mockReturnValueOnce({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: { value: '5' },
                        error: null
                    })
                })
            });

            // Transaction Insert
            mockSupabase.insert.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { id: 'txn_1' }, error: null })
                })
            });

            // Listing Update
            mockSupabase.update.mockReturnValue({
                eq: vi.fn().mockResolvedValue({ error: null })
            });

            const result = await recordSuccessfulPayment(validParams);

            expect(result.success).toBe(true);
            expect(result.orderId).toBe('txn_1');

            // Updates listing to sold
            expect(mockSupabase.update).toHaveBeenCalledWith({ status: 'sold' });
        });
    });
});
