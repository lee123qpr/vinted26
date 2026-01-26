import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getRevenueData } from '@/app/actions/admin-finance';
import { toggleUserBan } from '@/app/actions/admin';

// Mock query builder
const mockQueryBuilder = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    update: vi.fn(),
    or: vi.fn(),
    single: vi.fn(),
    then: vi.fn((resolve) => resolve({ data: [], error: null })), // Default resolution
};

// Chainable mocks
mockQueryBuilder.select.mockReturnValue(mockQueryBuilder);
mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder);
mockQueryBuilder.order.mockReturnValue(mockQueryBuilder);
mockQueryBuilder.gte.mockReturnValue(mockQueryBuilder);
mockQueryBuilder.lte.mockReturnValue(mockQueryBuilder);
mockQueryBuilder.update.mockReturnValue(mockQueryBuilder);
mockQueryBuilder.or.mockReturnValue(mockQueryBuilder);

const mockSupabase = {
    from: vi.fn(() => mockQueryBuilder),
    auth: {
        getUser: vi.fn(),
    }
};

vi.mock('@/lib/supabase/server', () => ({
    createAdminClient: vi.fn(() => Promise.resolve(mockSupabase)),
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock revalidatePath
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

describe('Admin Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default behaviors
        mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ data: [], error: null }));
    });

    describe('Finance: getRevenueData', () => {
        it('should correctly aggregate daily revenue', async () => {
            // Mock data
            const mockTransactions = [
                { created_at: '2026-01-01T10:00:00Z', total_price_gbp: 100, platform_fee_gbp: 5, payment_status: 'released' },
                { created_at: '2026-01-01T14:00:00Z', total_price_gbp: 50, platform_fee_gbp: 2.5, payment_status: 'released' },
                { created_at: '2026-01-02T10:00:00Z', total_price_gbp: 200, platform_fee_gbp: 10, payment_status: 'released' },
            ];

            // Setup mock return
            // For getRevenueData, the chain ends with await query.
            mockQueryBuilder.then.mockImplementationOnce((resolve: any) => resolve({ data: mockTransactions, error: null }));

            const result = await getRevenueData(undefined, undefined, 'daily');

            expect(result).toHaveLength(2); // Two days

            // Check Jan 01
            const day1 = result.find(d => d.date === '2026-01-01');
            expect(day1).toBeDefined();
            expect(day1?.revenue).toBe(150); // 100 + 50
            expect(day1?.platformFees).toBe(7.5); // 5 + 2.5
            expect(day1?.transactionCount).toBe(2);

            // Check Jan 02
            const day2 = result.find(d => d.date === '2026-01-02');
            expect(day2).toBeDefined();
            expect(day2?.revenue).toBe(200);
        });
    });

    describe('User Admin: toggleUserBan', () => {
        it('should fail if user is not admin', async () => {
            // Mock normal user
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user_123' } } });

            // Mock profile check returning NOT admin
            // single() is called. We verify the single().then() resolution.
            mockQueryBuilder.single.mockReturnValue({
                then: (resolve: any) => resolve({ data: { is_admin: false } })
            });

            await expect(toggleUserBan('target_user', false))
                .rejects
                .toThrow('Forbidden');
        });

        it('should succeed if user is admin', async () => {
            // Mock admin user
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'admin_123' } } });

            // Mock profile check returning IS admin
            // Note: toggleUserBan calls single() then later calls update(). 
            // We need separate behaviors.

            // First call (.single)
            mockQueryBuilder.single.mockReturnValueOnce({
                then: (resolve: any) => resolve({ data: { is_admin: true } })
            });

            // Second call (.update - awaiting the builder itself)
            // The default `then` on builder will handle the update result
            mockQueryBuilder.then.mockImplementation((resolve: any) => resolve({ error: null }));

            const result = await toggleUserBan('target_user', false);
            expect(result.success).toBe(true);
        });
    });
});
