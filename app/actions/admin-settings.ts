
'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateSetting(key: string, value: string, isActive: boolean) {
    const supabase = await createAdminClient();

    const { error } = await supabase
        .from('system_settings')
        .upsert({ key, value, is_active: isActive, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) throw new Error('Failed to update setting');
    revalidatePath('/admin/settings');
    revalidatePath('/', 'layout'); // Revalidate global layout for Banner/Maintenance changes
}
