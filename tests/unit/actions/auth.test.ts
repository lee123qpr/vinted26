import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signOutAction } from '@/app/actions/auth';
import { createMockSupabase } from '../../utils/supabase-mock';
import { redirect } from 'next/navigation';

// Mock Next Types
vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}));

// Mock Supabase
const mockSupabase = createMockSupabase();
vi.mock('@/lib/supabase/server', () => ({
    createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

describe('Auth Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('signOutAction', () => {
        it('should sign out and redirect', async () => {
            await signOutAction();
            expect(mockSupabase.auth.signOut).toHaveBeenCalled();
            expect(redirect).toHaveBeenCalledWith('/');
        });
    });
});
