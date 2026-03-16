import { vi } from 'vitest';

export const mockSupabase: any = {
    from: vi.fn(() => mockSupabase),
    select: vi.fn(() => mockSupabase),
    insert: vi.fn(() => mockSupabase),
    update: vi.fn(() => mockSupabase),
    delete: vi.fn(() => mockSupabase),
    eq: vi.fn(() => mockSupabase),
    neq: vi.fn(() => mockSupabase),
    lt: vi.fn(() => mockSupabase),
    lte: vi.fn(() => mockSupabase),
    gt: vi.fn(() => mockSupabase),
    gte: vi.fn(() => mockSupabase),
    in: vi.fn(() => mockSupabase),
    contains: vi.fn(() => mockSupabase),
    order: vi.fn(() => mockSupabase),
    limit: vi.fn(() => mockSupabase),
    single: vi.fn(() => mockSupabase),
    maybeSingle: vi.fn(() => mockSupabase),
    toFile: vi.fn(() => mockSupabase),
    upload: vi.fn(() => mockSupabase),
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock.url' } })),
    auth: {
        getUser: vi.fn(),
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
    },
    storage: {
        from: vi.fn(() => mockSupabase),
    },
    rpc: vi.fn(() => mockSupabase),
};

// Start chain with specific return values
export const createMockSupabase = (overrides = {}): any => {
    const mock = { ...mockSupabase, ...overrides };
    // Reset standard mocks
    mock.from.mockReturnValue(mock);
    mock.select.mockReturnValue(mock);
    mock.insert.mockReturnValue(mock);
    mock.update.mockReturnValue(mock);
    mock.delete.mockReturnValue(mock);
    mock.eq.mockReturnValue(mock);
    mock.single.mockReturnValue(mock);
    return mock;
};
