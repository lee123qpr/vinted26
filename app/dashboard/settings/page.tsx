'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import AvatarUpload from '@/components/AvatarUpload';

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [username, setUsername] = useState('');
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [bio, setBio] = useState('');

    // Private Details
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [location, setLocation] = useState('');
    const [postcodeArea, setPostcodeArea] = useState('');

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUser(user);
                setEmail(user.email || '');

                // Fetch profile data
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUsername(profile.username || '');
                    setAvatarUrl(profile.avatar_url || null);
                    setFullName(profile.full_name || '');
                    setBio(profile.bio || '');
                    setLocation(profile.location || '');
                    setPostcodeArea(profile.postcode_area || '');
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

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

    if (loading) return <div className="p-8">Loading...</div>;

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
                                value={email}
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
                    <div className="flex justify-end pt-4 border-t border-secondary-100">
                        <button
                            type="submit"
                            disabled={saving}
                            className={`btn-primary px-8 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
