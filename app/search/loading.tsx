export default function SearchLoading() {
    return (
        <div className="min-h-screen bg-secondary-50 pt-6 pb-12 animate-pulse w-full">
            <div className="container-custom">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar Skeleton */}
                    <div className="w-full lg:w-64 flex-shrink-0 bg-white p-6 rounded-xl border border-secondary-100 h-fit">
                        <div className="h-6 bg-secondary-200 rounded w-1/2 mb-6"></div>
                        <div className="space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-3">
                                    <div className="h-4 bg-secondary-200 rounded w-1/3"></div>
                                    <div className="h-10 bg-secondary-100 rounded w-full"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Results Grid Skeleton */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <div className="h-6 bg-secondary-200 rounded w-1/4"></div>
                            <div className="h-10 bg-secondary-200 rounded w-32"></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="bg-white rounded-xl shadow-sm border border-secondary-100 overflow-hidden flex flex-col h-[380px]">
                                    <div className="h-48 bg-secondary-200 w-full"></div>
                                    <div className="p-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-3">
                                            <div className="h-6 bg-secondary-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-secondary-100 rounded w-1/2"></div>
                                        </div>
                                        <div className="flex justify-between items-end mt-4">
                                            <div className="h-8 bg-secondary-200 rounded w-1/3"></div>
                                            <div className="h-8 w-8 bg-secondary-100 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
