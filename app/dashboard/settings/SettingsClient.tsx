'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import AvatarUpload from '@/components/AvatarUpload';
import { deleteAccount } from '@/app/actions/account';

interface Props {
    user: any;
    initialProfile: any;
}

export default function SettingsClient({ user, initialProfile }: Props) {
    const [savingProfile, setSavingProfile] = useState(false);
    const [connectingStripe, setConnectingStripe] = useState(false);

    // Form State
    const [username, setUsername] = useState(initialProfile?.username || '');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile?.avatar_url || null);
    const [bio, setBio] = useState(initialProfile?.bio || '');

    // Private Details
    const [fullName, setFullName] = useState(initialProfile?.full_name || '');
    const [location, setLocation] = useState(initialProfile?.location || '');
    const [postcodeArea, setPostcodeArea] = useState(initialProfile?.postcode_area || '');

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE') return;
        setIsDeleting(true);

        try {
            // Direct usage of server action
            const result = await deleteAccount();

            if (result.error) {
                throw new Error(result.error);
            }

            // Redirect happening in server action usually, but we can double tap
            window.location.href = '/';

        } catch (err: unknown) {
            console.error('Error deleting account:', err);
            setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
            setShowDeleteModal(false);
            setIsDeleting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        setMessage(null);

        try {
            const updates: any = {
                avatar_url: avatarUrl,
                full_name: fullName,
                bio,
                location,
                postcode_area: postcodeArea,
                updated_at: new Date().toISOString()
            };

            // Allow updating username if it was previously the full name
            if (username !== '' && username !== fullName) {
                updates.username = username;
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: unknown) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSavingProfile(false);
        }
    };

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-secondary-900 mb-6">Account Settings</h1>

            <div className="bg-white rounded-xl shadow-sm p-8">
                <form onSubmit={handleSave} className="space-y-8">

                    {/* Public Profile Section */}
                    <div className="space-y-6">
                        <div className="border-b border-secondary-100 pb-2">
                            <h2 className="text-xl font-bold text-secondary-900">Public Identity</h2>
                            <p className="text-sm text-secondary-500">This information will be visible to other users.</p>
                        </div>

                        {/* Avatar */}
                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-2">Profile Photo</label>
                            <AvatarUpload
                                uid={user?.id}
                                url={avatarUrl}
                                size={120}
                                onUpload={(url) => setAvatarUrl(url)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Username</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={username !== fullName && username !== ''}
                                className={`w-full px-4 py-2 border rounded-lg ${username === fullName || username === '' ? 'bg-white border-secondary-300 focus:ring-2 focus:ring-primary-500' : 'bg-secondary-50 border-secondary-200 text-secondary-600 cursor-not-allowed'}`}
                                title={username === fullName ? "Please update your username" : "Username cannot be changed"}
                            />
                            {username === fullName ? (
                                <p className="text-xs text-red-500 mt-1 font-medium">Your username currently matches your full name. Please change it to a unique username.</p>
                            ) : (
                                <p className="text-xs text-secondary-400 mt-1">Usernames are permanent and cannot be changed.</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Bio</label>
                            <textarea
                                rows={4}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell others about yourself..."
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Private Details Section */}
                    <div className="space-y-6 pt-4">
                        <div className="border-b border-secondary-100 pb-2">
                            <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                                <svg className="w-5 h-5 text-secondary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Private Account Details
                            </h2>
                            <p className="text-sm text-secondary-500">These details are kept private and only shared for confirmed transactions.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">Email Address</label>
                            <input
                                type="text"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-lg text-secondary-600 cursor-not-allowed"
                            />
                            <p className="text-xs text-secondary-400 mt-1">To change your email, please contact support.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary-700 mb-1">
                                Full Name <span className="text-secondary-400 font-normal">(Private)</span>
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                            <p className="text-xs text-secondary-400 mt-1">Only shown on shipping labels and invoices.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">City / Town</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Postcode Area</label>
                                <input
                                    type="text"
                                    value={postcodeArea}
                                    onChange={(e) => setPostcodeArea(e.target.value)}
                                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                                    placeholder="e.g. SW1"
                                />
                                <p className="text-xs text-secondary-500 mt-1">Used to calculate delivery distances.</p>
                            </div>
                        </div>

                    </div>

                    {/* Message Area */}
                    {message && (
                        <div className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                            {message.text}
                        </div>
                    )}


                    {/* Submit */}
                    <div className="flex justify-end pt-4 border-t border-secondary-100 pb-2">
                        <button
                            type="submit"
                            disabled={savingProfile}
                            className={`btn-primary px-8 ${savingProfile ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

                {/* Payments Section */}
                <div className="pt-6 mb-12">
                    <div className="border-b border-secondary-100 pb-2 mb-4">
                        <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                            <span className="text-xl">💳</span>
                            Seller Payouts
                        </h2>
                        <p className="text-sm text-secondary-500">Connect your bank account to receive funds from sales.</p>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-secondary-900">Stripe Connect</h3>
                                <svg viewBox="0 0 60 25" xmlns="http://www.w3.org/2000/svg" className="h-4 w-auto drop-shadow-sm">
                                  <path fill="#635BFF" d="M59.64 14.28h-8.06c.19 1.93 1.6 3.06 3.2 3.06 1.02 0 1.87-.26 2.59-.73l1.19 2.58c-1.37.81-3.15 1.11-4.66 1.11-3.66 0-5.86-2.28-5.86-5.99 0-3.63 2.18-6.19 5.59-6.19 3.52 0 5.43 2.65 5.43 6.09 0 .28-.02.66-.05 1.07zm-4.73-2.31c-.13-1.63-1.22-2.71-2.61-2.71-1.39 0-2.45 1.08-2.67 2.71h5.28zM43.6 8.52h2.95v11.39c0 .19.06.26.19.26.24 0 .6-.07.9-.19l.51 2.58c-.59.26-1.57.41-2.46.41-1.92 0-2.78-1-2.78-2.62v-9H41.3v-2.83h1.61V5.7l3.63-1.07v3.89H43.6v.01zM34.78 8.44c1.19 0 2.21.36 2.87.89l-.91 2.8c-.46-.37-1.12-.64-1.89-.64-1.66 0-2.5 1.05-2.5 2.57v5.85H28.7V8.52h2.95v1.48c.83-1.07 1.95-1.56 3.13-1.56zM24.81 8.52V23h-3.66V8.52h3.66zm-1.83-5.32c1.23 0 2.22.99 2.22 2.22 0 1.23-.99 2.22-2.22 2.22s-2.22-.99-2.22-2.22c.01-1.23 1-2.22 2.22-2.22zM15.34 8.44c1.69 0 2.75.92 3.16 2.05l.02.04v-1.63L22 8.59l-.02 5.09c0 3.73-2.11 6.67-6.55 6.67-2.66 0-4.67-.84-5.69-1.58l1.41-2.7c.94.59 2.5 1.2 4.14 1.2 2.11 0 3.03-1.22 3.03-3.05v-.74c-.58.85-1.74 1.58-3.4 1.58-3.1 0-5.74-2.5-5.74-6.07 0-3.68 2.55-6.17 5.76-6.17v-.01h.03zm.57 9.17c1.76 0 2.92-1.39 2.92-3.19 0-1.79-1.17-3.17-2.92-3.17-1.74 0-2.94 1.37-2.94 3.17 0 1.79 1.19 3.19 2.94 3.19zM7.05 15.6c0 1.17.96 1.91 2.48 1.91 1.42 0 2.45-.63 2.45-1.54 0-.91-.58-1.42-1.89-1.76l-1.69-.44c-2-.54-3.5-1.65-3.5-3.64 0-2.24 1.84-3.9 4.88-3.9 2.37 0 4 .76 5.02 1.48l-1.29 2.68c-.76-.48-1.92-1.22-3.58-1.22-1.15 0-1.81.42-1.81 1.18 0 .61.46.99 1.82 1.35l1.58.42c2.25.61 3.59 1.58 3.59 3.79 0 2.45-1.95 4.07-5.11 4.07-2.58 0-4.64-.81-5.78-1.6l1.39-2.78z" />
                                </svg>
                            </div>
                            <p className="text-sm text-secondary-500">Secure payments and payouts via Stripe.</p>
                            {initialProfile?.stripe_charges_enabled && (
                                <p className="text-xs text-green-600 font-bold mt-1">✅ Payouts Active</p>
                            )}
                        </div>

                        {initialProfile?.stripe_charges_enabled ? (
                            <button
                                type="button"
                                disabled
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold cursor-default"
                            >
                                Connected
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        setConnectingStripe(true);
                                        const res = await fetch('/api/stripe/connect', { method: 'POST' });
                                        const data = await res.json();
                                        if (data.url) window.location.href = data.url;
                                        else throw new Error(data.error);
                                    } catch (err: unknown) {
                                        const msg = err instanceof Error ? err.message : 'Connect failed';
                                        alert('Connect failed: ' + msg);
                                        setConnectingStripe(false);
                                    }
                                }}
                                disabled={connectingStripe}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                {connectingStripe ? 'Connecting...' : 'Connect Bank'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="border border-red-200 rounded-xl overflow-hidden mt-12">
                    <div className="bg-red-50 p-4 border-b border-red-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-red-800">Danger Zone</h3>
                            <p className="text-sm text-red-600">Irreversible actions for your account.</p>
                        </div>
                    </div>
                    <div className="p-6 bg-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-secondary-900">Delete Account</h4>
                                <p className="text-sm text-secondary-500 max-w-md">
                                    Permanently remove your personal data and listings. Your reviews will remain visible but anonymized.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-4 py-2 border border-red-300 text-red-700 font-semibold rounded-lg hover:bg-red-50 transition"
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-secondary-900 mb-2">Delete Account?</h3>
                            <p className="text-secondary-600 mb-4">
                                This action is <strong>irreversible</strong>. All your listings and personal details will be removed immediately.
                            </p>
                            <div className="bg-secondary-50 p-4 rounded-lg text-sm text-secondary-700 mb-4">
                                <p className="mb-2 font-semibold">What will be deleted:</p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Your public profile (anonymized)</li>
                                    <li>All active listings</li>
                                    <li>Personal data (email, bio, location)</li>
                                </ul>
                                <p className="mt-2 font-semibold">What remains:</p>
                                <ul className="list-disc pl-5">
                                    <li>Reviews you&apos;ve left or received (anonymized)</li>
                                </ul>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">
                                    Type <span className="font-bold select-none">DELETE</span> to confirm
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                    className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 uppercase"
                                    placeholder="DELETE"
                                />
                            </div>

                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== 'DELETE' || isDeleting}
                                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${deleteConfirmation === 'DELETE'
                                    ? 'bg-red-600 hover:bg-red-700 shadow-lg'
                                    : 'bg-secondary-200 text-secondary-400 cursor-not-allowed'
                                    }`}
                            >
                                {isDeleting ? 'Deleting Account...' : 'Permanently Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
