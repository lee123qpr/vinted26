export default function DashboardLoading() {
    return (
        <div className="space-y-6 animate-pulse w-full">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between mb-8">
                <div className="h-8 bg-secondary-200 rounded w-1/3 md:w-1/4"></div>
                <div className="h-6 bg-secondary-200 rounded w-1/4 md:w-1/6"></div>
            </div>

            {/* Stats Cards Skeleton (Overview Page style) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-secondary-100 h-32 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                            <div className="w-10 h-10 bg-secondary-100 rounded-lg"></div>
                        </div>
                        <div className="h-8 bg-secondary-200 rounded w-1/3"></div>
                    </div>
                ))}
            </div>

            {/* Main Table/List Skeleton */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-secondary-100">
                {/* Table Header area */}
                <div className="h-12 bg-secondary-50 border-b border-secondary-100 flex items-center px-6 gap-4 hidden sm:flex">
                    <div className="h-4 bg-secondary-200 rounded w-1/4"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/6"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/6"></div>
                    <div className="h-4 bg-secondary-200 rounded w-1/6"></div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-secondary-100">
                    {[1, 2, 3, 4, 5].map((row) => (
                        <div key={row} className="p-4 sm:px-6 flex items-center justify-between gap-4">
                            {/* Image + Title */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex-shrink-0"></div>
                                <div className="space-y-2 flex-1 max-w-xs">
                                    <div className="h-4 bg-secondary-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-secondary-100 rounded w-1/2"></div>
                                </div>
                            </div>
                            
                            {/* Columns (hidden on mobile skeleton) */}
                            <div className="hidden sm:block h-4 bg-secondary-200 rounded w-1/6"></div>
                            <div className="hidden sm:block h-4 bg-secondary-200 rounded w-1/6"></div>
                            
                            {/* Action Button */}
                            <div className="w-20 h-8 bg-secondary-100 rounded-md flex-shrink-0"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
