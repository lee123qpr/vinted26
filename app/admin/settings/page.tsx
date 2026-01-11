
import { createAdminClient } from '@/lib/supabase/server';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
    const supabase = await createAdminClient();
    const { data: settings } = await supabase.from('system_settings').select('*');

    const maintenanceMode = settings?.find(s => s.key === 'maintenance_mode');
    const bannerText = settings?.find(s => s.key === 'global_banner_text');
    const bannerPresets = settings?.find(s => s.key === 'banner_presets');

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">System Settings</h1>

            <div className="max-w-2xl">
                <SettingsForm
                    maintenanceMode={maintenanceMode}
                    bannerText={bannerText}
                    bannerPresets={bannerPresets ? JSON.parse(bannerPresets.value) : []}
                />
            </div>
        </div>
    );
}
