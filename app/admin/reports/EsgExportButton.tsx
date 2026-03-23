'use client';

import { useState } from 'react';
import { exportEsgData } from '@/app/actions/esg-export';

export default function EsgExportButton() {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const result = await exportEsgData();
            if (!result.success || !result.csv) {
                alert(result.error || 'Failed to export data');
                return;
            }

            // Create Blob and Download
            const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `skipped-esg-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Export Error:', error);
            alert('An unexpected error occurred during export.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            title="Download total carbon & weight savings for all successful transactions"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {isExporting ? 'Generating CSV...' : 'Export ESG Data'}
        </button>
    );
}
