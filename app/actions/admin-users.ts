'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteUser(userId: string) {
    const supabase = await createAdminClient();

    // Delete from auth.users (requires service_role)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
        throw new Error('Failed to delete user: ' + error.message);
    }

    revalidatePath('/admin/users');
}
