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
    const [saving, setSaving] = useState(false);

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

        } catch (err: any) {
            console.error('Error deleting account:', err);
            setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
            setShowDeleteModal(false);
            setIsDeleting(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
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
        } catch (err: any) {
            console.error('Error updating profile:', err);
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
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

                        {/* Payments Section */}
                        <div className="pt-6 border-t border-secondary-100">
                            <div className="border-b border-secondary-100 pb-2 mb-4">
                                <h2 className="text-xl font-bold text-secondary-900 flex items-center gap-2">
                                    <span className="text-xl">💳</span>
                                    Seller Payouts
                                </h2>
                                <p className="text-sm text-secondary-500">Connect your bank account to receive funds from sales.</p>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-secondary-900">Stripe Connect</h3>
                                    <p className="text-sm text-secondary-500">Secure payments and payouts via Stripe.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => alert('In this test environment, payments are simulated. In production, this would open Stripe onboarding.')}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold hover:bg-indigo-700 transition"
                                >
                                    Connect Bank
                                </button>
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
                    <div className="flex justify-end pt-4 border-t border-secondary-100 mb-12">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`btn-primary px-8 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>

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
