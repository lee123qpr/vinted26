
'use client';

import { useTransition, useState } from 'react';
import { updateSetting } from '@/app/actions/admin-settings';

export default function SettingsForm({ maintenanceMode, bannerText, bannerPresets = [] }: { maintenanceMode: any, bannerText: any, bannerPresets?: string[] }) {
    const [isPending, startTransition] = useTransition();

    // Local state for banner text input
    const [bannerInput, setBannerInput] = useState(bannerText?.value || '');
    const [presets, setPresets] = useState<string[]>(bannerPresets);

    const handleToggleMaintenance = (checked: boolean) => {
        startTransition(async () => {
            await updateSetting('maintenance_mode', checked ? 'true' : 'false', checked);
        });
    };

    const handleSaveBanner = () => {
        startTransition(async () => {
            await updateSetting('global_banner_text', bannerInput, !!bannerInput);
            alert('Banner updated');
        });
    };

    const handleSavePreset = () => {
        if (!bannerInput || presets.includes(bannerInput)) return;
        const newPresets = [...presets, bannerInput];
        setPresets(newPresets);
        startTransition(async () => {
            await updateSetting('banner_presets', JSON.stringify(newPresets), true);
        });
    };

    const handleDeletePreset = (index: number) => {
        const newPresets = presets.filter((_, i) => i !== index);
        setPresets(newPresets);
        startTransition(async () => {
            await updateSetting('banner_presets', JSON.stringify(newPresets), true);
        });
    };

    return (
        <div className="space-y-8">
            {/* Maintenance Mode */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900">Maintenance Mode</h3>
                    <p className="text-sm text-slate-500">Disable the site for all users except admins.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={maintenanceMode?.is_active || false}
                        onChange={(e) => handleToggleMaintenance(e.target.checked)}
                        disabled={isPending}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
            </div>

            {/* Global Banner */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-4">Global Announcement Banner</h3>

                {/* Presets */}
                {presets.length > 0 && (
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Load Preset</label>
                        <div className="flex flex-wrap gap-2">
                            {presets.map((preset: string, idx: number) => (
                                <button
                                    key={idx}
                                    onClick={() => setBannerInput(preset)}
                                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full transition-colors flex items-center gap-2 group"
                                >
                                    {preset.length > 30 ? preset.substring(0, 30) + '...' : preset}
                                    <span
                                        onClick={(e) => { e.stopPropagation(); handleDeletePreset(idx); }}
                                        className="text-slate-400 hover:text-red-500 font-bold px-1 hidden group-hover:inline-block"
                                    >
                                        ×
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex gap-4 mb-2">
                    <input
                        type="text"
                        value={bannerInput}
                        onChange={(e) => setBannerInput(e.target.value)}
                        placeholder="Enter announcement text (e.g. 'Flash Sale this Weekend!')"
                        className="flex-1 px-4 py-2 border rounded-lg text-sm"
                    />
                    <button
                        onClick={handleSaveBanner}
                        disabled={isPending}
                        className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                        Save Live
                    </button>
                </div>

                <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-slate-400">Leave empty to hide the banner.</p>
                    {bannerInput && !presets.includes(bannerInput) && (
                        <button
                            onClick={handleSavePreset}
                            disabled={isPending}
                            className="text-xs font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"
                        >
                            + Save as Preset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
