
'use server';

import { createAdminClient, createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Toggles the 'is_trade_verified' status for a user profile.
 */
export async function toggleUserVerification(userId: string, currentStatus: boolean) {
    // 1. Check if requester is admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) throw new Error('Forbidden');

    // 2. Update the target profile
    const adminSupabase = await createAdminClient();

    const { error } = await adminSupabase
        .from('profiles')
        .update({ is_trade_verified: !currentStatus })
        .eq('id', userId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/users');
    return { success: true };
}

/**
 * Bans a user using Supabase Auth Admin API.
 * This sets 'banned_until' to far future (or clears it to unban).
 */
export async function toggleUserBan(userId: string, isBanned: boolean) {
    // 1. Check Authorization
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) throw new Error('Forbidden');

    // Update account status in database instead of using auth ban
    const adminSupabase = await createAdminClient();

    const newStatus = isBanned ? 'active' : 'banned';

    const { error: updateError } = await adminSupabase
        .from('profiles')
        .update({
            account_status: newStatus,
            suspension_reason: isBanned ? null : 'Permanently banned by admin'
        })
        .eq('id', userId);

    if (updateError) throw new Error(updateError.message);

    revalidatePath('/admin/users');
    return { success: true };
}

/**
 * Suspend a user for a specified number of days
 */
export async function suspendUser(userId: string, days: number, reason: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) throw new Error('Forbidden');

    const adminSupabase = await createAdminClient();

    const suspensionEndDate = days === 0
        ? null
        : new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    const accountStatus = days === 0 ? 'banned' : 'suspended';

    const { error } = await adminSupabase
        .from('profiles')
        .update({
            account_status: accountStatus,
            suspension_end_date: suspensionEndDate,
            suspension_reason: reason
        })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/users');
    return { success: true };
}

/**
 * Send a warning to a user
 */
export async function warnUser(userId: string, message: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) throw new Error('Forbidden');

    const adminSupabase = await createAdminClient();

    const { error } = await adminSupabase
        .from('profiles')
        .update({
            account_status: 'warned',
            suspension_reason: message
        })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    // TODO: Send email/notification to user with warning message

    revalidatePath('/admin/users');
    return { success: true };
}

/**
 * Unsuspend a user (restore to active status)
 */
export async function unsuspendUser(userId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) throw new Error('Forbidden');

    const adminSupabase = await createAdminClient();

    const { error } = await adminSupabase
        .from('profiles')
        .update({
            account_status: 'active',
            suspension_end_date: null,
            suspension_reason: null
        })
        .eq('id', userId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/users');
    return { success: true };
}

/**
 * Delete a user account (admin only)
 */
export async function deleteUserAccount(userId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

    if (!adminProfile?.is_admin) throw new Error('Forbidden');

    const adminSupabase = await createAdminClient();

    // Delete from auth (this will cascade to profile via trigger)
    const { error } = await adminSupabase.auth.admin.deleteUser(userId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/users');
    return { success: true };
}
