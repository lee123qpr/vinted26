export default function Loading() {
    return (
        <div className="min-h-screen bg-secondary-50 pb-12">
            <div className="animate-pulse">
                {/* Hero Skeleton / Header Skeleton */}
                <div className="h-64 bg-secondary-200 mb-8"></div>

                <div className="container-custom">
                    {/* Content Skeleton */}
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="h-8 bg-secondary-200 rounded w-3/4"></div>
                        <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                        <div className="h-4 bg-secondary-200 rounded w-5/6"></div>
                    </div>

                    {/* Grid Skeleton */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="bg-white rounded-xl h-80 p-4 border border-secondary-100">
                                <div className="h-48 bg-secondary-100 rounded-lg mb-4"></div>
                                <div className="h-6 bg-secondary-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-secondary-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
