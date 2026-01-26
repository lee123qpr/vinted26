import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateOrderStatus, createReview, createDispute } from '@/app/actions/orders';
import { createMockSupabase } from '../../utils/supabase-mock';

// Mock Next.js cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mock Notifications
vi.mock('@/app/actions/notifications', () => ({
    createNotification: vi.fn().mockResolvedValue({ success: true }),
}));

// Mock Supabase Client
const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
    createAdminClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock Stripe
vi.mock('@/lib/stripe', () => ({
    stripe: {
        transfers: {
            create: vi.fn().mockResolvedValue({ id: 'tr_123' })
        }
    }
}));

describe('Orders Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('updateOrderStatus', () => {
        it('should return error if unauthorized', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error() });
            const result = await updateOrderStatus('order_1', 'shipped');
            expect(result.error).toBe('Unauthorized');
        });

        it('should allow seller to mark as shipped', async () => {
            // User is seller
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'seller_1' } }, error: null });

            // Order exists and belongs to seller
            mockSupabase.select.mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: {
                            id: 'order_1',
                            seller_id: 'seller_1',
                            buyer_id: 'buyer_1',
                            order_status: 'pending'
                        },
                        error: null
                    })
                })
            });

            const result = await updateOrderStatus('order_1', 'shipped');
            expect(result.success).toBe(true);
            expect(mockSupabase.update).toHaveBeenCalledWith({ order_status: 'shipped' });
        });
    });

    describe('createDispute', () => {
        it('should create dispute correctly with opened_by_id', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'buyer_1' } }, error: null });

            // Tranasaction setup
            mockSupabase.select.mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({
                        data: {
                            id: 'txn_1',
                            buyer_id: 'buyer_1',
                            order_status: 'shipped'
                        },
                        error: null
                    })
                })
            });

            // Dispute Insert
            mockSupabase.insert.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { id: 'dispute_1' }, error: null })
                })
            });

            const result = await createDispute('txn_1', 'item_not_received', 'I did not get it');

            expect(result.success).toBe(true);
            // Verify correct column usage from previous fix
            expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
                opened_by_id: 'buyer_1'
            }));

            // Verify status update
            expect(mockSupabase.update).toHaveBeenCalledWith({
                order_status: 'disputed'
            });
        });
    });
});
