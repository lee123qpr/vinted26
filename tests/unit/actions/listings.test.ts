import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createListing, deleteListing } from '@/app/actions/listings';
import { createMockSupabase } from '../../utils/supabase-mock';

// Mock Next.js cache
vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

// Mock Supabase Client
const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
    createAdminClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Listings Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createListing', () => {
        it('should return error if user is not authenticated', async () => {
            // Setup auth failure
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: new Error('No user') });

            const formData = new FormData();
            const result = await createListing(formData);

            expect(result.error).toContain('logged in');
        });

        it('should return validation error for empty data', async () => {
            // Setup auth success
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user_123' } }, error: null });

            const formData = new FormData();
            // Missing required fields

            const result = await createListing(formData);
            expect(result.error).toContain('Validation failed');
        });

        it('should create a listing successfully with valid data', async () => {
            // Setup auth success
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user_123' } }, error: null });

            // Setup successful insert
            mockSupabase.insert.mockReturnValue({
                select: vi.fn().mockReturnValue({
                    single: vi.fn().mockResolvedValue({ data: { id: 'listing_999' }, error: null })
                })
            });

            const formData = new FormData();
            formData.append('title', 'Test Brick');
            formData.append('description', 'A nice red brick');
            formData.append('categoryId', 'cat_1');
            formData.append('price', '10.50');
            formData.append('quantity', '100');
            formData.append('condition', 'new_unused');
            formData.append('postcodeArea', 'London');
            formData.append('lat', '51.5');
            formData.append('lng', '-0.1');

            // Required booleans
            formData.append('isFree', 'false');
            formData.append('includeCarbonCertificate', 'false');
            formData.append('offersCollection', 'true');
            formData.append('offersDelivery', 'false');
            formData.append('courierAvailable', 'false');

            const result = await createListing(formData);

            expect(result.success).toBe(true);
            expect(result.listingId).toBe('listing_999');
            expect(mockSupabase.from).toHaveBeenCalledWith('listings');
        });
    });

    describe('deleteListing', () => {
        it('should delete listing if owned by user', async () => {
            mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user_123' } }, error: null });

            // Mock delete chain
            mockSupabase.delete.mockReturnValue({
                eq: vi.fn().mockReturnValue({ // id
                    eq: vi.fn().mockResolvedValue({ error: null }) // seller_id
                })
            });

            const result = await deleteListing('listing_999');
            expect(result.success).toBe(true);
        });
    });
});
