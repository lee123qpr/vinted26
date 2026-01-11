'use client';

import { useTransition, useState } from 'react';
import Link from 'next/link';
import { deleteUser } from '@/app/actions/admin-users';
import { suspendUser, warnUser, unsuspendUser } from '@/app/actions/admin';

type User = {
    id: string;
    email: string;
    full_name: string;
    created_at: string;
    avatar_url: string | null;
    is_admin: boolean;
    total_sales: number;
    total_purchases: number;
    total_carbon_saved_kg: number;
    rank: number;
    account_status?: string;
    suspension_end_date?: string | null;
    suspension_reason?: string | null;
};

export default function UserTable({ users }: { users: User[] }) {
    const [isPending, startTransition] = useTransition();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const handleDelete = (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

        startTransition(async () => {
            try {
                await deleteUser(userId);
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    const handleSuspend = (userId: string, days: number) => {
        const reason = prompt(`Reason for ${days === 0 ? 'permanent ban' : `${days}-day suspension`}:`);
        if (!reason) return;

        startTransition(async () => {
            try {
                await suspendUser(userId, days, reason);
                setOpenDropdown(null);
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    const handleWarn = (userId: string) => {
        const message = prompt('Warning message to user:');
        if (!message) return;

        startTransition(async () => {
            try {
                await warnUser(userId, message);
                setOpenDropdown(null);
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    const handleUnsuspend = (userId: string) => {
        if (!confirm('Restore this user to active status?')) return;

        startTransition(async () => {
            try {
                await unsuspendUser(userId);
            } catch (e: any) {
                alert(e.message);
            }
        });
    };

    const getStatusBadge = (user: User) => {
        const status = user.account_status || 'active';

        switch (status) {
            case 'suspended':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                        Suspended
                        {user.suspension_end_date && (
                            <span className="ml-1 text-[10px]">
                                (until {new Date(user.suspension_end_date).toLocaleDateString()})
                            </span>
                        )}
                    </span>
                );
            case 'warned':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Warned</span>;
            case 'banned':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Banned</span>;
            default:
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Active</span>;
        }
    };

    return (
        <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                    <th className="px-6 py-4 font-semibold text-slate-900 w-16">Rank</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">User</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-900">Role</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Sales</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Purchases</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Carbon (kg)</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Joined</th>
                    <th className="px-6 py-4 font-semibold text-slate-900 text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-400">
                            #{user.rank}
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span className="text-xs font-bold text-slate-500">{user.email?.[0]?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{user.full_name || 'No Name'}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            {getStatusBadge(user)}
                        </td>
                        <td className="px-6 py-4">
                            {user.is_admin ? (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">Admin</span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">User</span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-900">
                            {user.total_sales || 0}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-slate-900">
                            {user.total_purchases || 0}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-green-700">
                            {user.total_carbon_saved_kg?.toFixed(1) || '0.0'}
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-mono">
                            {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                                <Link
                                    href={`/profile/${user.id}`}
                                    target="_blank"
                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                    title="View Public Profile"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </Link>
                                <Link
                                    href={`/admin/listings?seller_id=${user.id}`}
                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                    title="View Listings"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                                </Link>
                                <Link
                                    href={`/messages?recipient_id=${user.id}`}
                                    target="_blank"
                                    className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                                    title="Message User"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </Link>

                                {!user.is_admin && (
                                    <>
                                        {/* Suspension Dropdown */}
                                        <div className="relative">
                                            <button
                                                onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                                disabled={isPending}
                                                className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors disabled:opacity-50"
                                                title="Suspend User"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                            </button>

                                            {openDropdown === user.id && (
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                                                    <div className="py-1">
                                                        {(user.account_status === 'suspended' || user.account_status === 'warned' || user.account_status === 'banned') && (
                                                            <button
                                                                onClick={() => handleUnsuspend(user.id)}
                                                                className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                                            >
                                                                ✓ Restore to Active
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleWarn(user.id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                                                        >
                                                            ⚠ Send Warning
                                                        </button>
                                                        <button
                                                            onClick={() => handleSuspend(user.id, 7)}
                                                            className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                                                        >
                                                            Suspend 7 Days
                                                        </button>
                                                        <button
                                                            onClick={() => handleSuspend(user.id, 14)}
                                                            className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                                                        >
                                                            Suspend 14 Days
                                                        </button>
                                                        <button
                                                            onClick={() => handleSuspend(user.id, 30)}
                                                            className="w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                                                        >
                                                            Suspend 30 Days
                                                        </button>
                                                        <button
                                                            onClick={() => handleSuspend(user.id, 0)}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 border-t border-slate-200"
                                                        >
                                                            🚫 Permanent Ban
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            disabled={isPending}
                                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                                            title="Delete User"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
