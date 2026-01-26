export default function Loading() {
    return (
        <div className="min-h-screen bg-secondary-50 pb-12 pt-8">
            <div className="container-custom animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Skeleton */}
                    <div className="aspect-square bg-secondary-200 rounded-2xl"></div>

                    {/* Details Skeleton */}
                    <div className="space-y-6">
                        {/* Title & Price */}
                        <div className="space-y-2">
                            <div className="h-10 bg-secondary-200 rounded-lg w-3/4"></div>
                            <div className="h-8 bg-secondary-200 rounded-lg w-1/4"></div>
                        </div>

                        {/* Seller Info */}
                        <div className="flex items-center space-x-4 py-6 border-y border-secondary-200">
                            <div className="w-12 h-12 bg-secondary-200 rounded-full"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-secondary-200 rounded w-32"></div>
                                <div className="h-3 bg-secondary-200 rounded w-24"></div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4">
                            <div className="h-12 bg-secondary-200 rounded-lg flex-1"></div>
                            <div className="h-12 bg-secondary-200 rounded-lg flex-1"></div>
                        </div>

                        {/* Description */}
                        <div className="space-y-3 pt-6">
                            <div className="h-4 bg-secondary-200 rounded w-full"></div>
                            <div className="h-4 bg-secondary-200 rounded w-full"></div>
                            <div className="h-4 bg-secondary-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
