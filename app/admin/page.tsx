import { formatCurrency } from '@/lib/format';

export default function AdminDashboardPage() {
    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Users', value: '1,245', colour: 'blue' },
                    { label: 'Active Listings', value: '3,892', colour: 'green' },
                    { label: 'Pending Disputes', value: '5', colour: 'red' },
                    { label: 'Total Revenue', value: '£12,450', colour: 'purple' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="text-sm font-medium text-gray-500 mb-1">{stat.label}</div>
                        <div className={`text-2xl font-bold text-${stat.colour}-600`}>{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Transactions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Recent Transactions</h3>
                        <button className="text-sm text-primary-600 hover:text-primary-700">View All</button>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900">#TRX-829{i}</p>
                                    <p className="text-xs text-gray-500">2 mins ago • user_123 to user_456</p>
                                </div>
                                <span className="font-semibold text-gray-900">{formatCurrency(Math.random() * 200)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Listings for Review */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-900">Listings Requiring Attention</h3>
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">3 pending</span>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-900 line-clamp-1">Suspicious Item Title {i} - Check Description</p>
                                    <p className="text-xs text-gray-500">Reported for: Misleading Description</p>
                                </div>
                                <div className="flex space-x-2">
                                    <button className="p-2 text-green-600 hover:bg-green-50 rounded">✓</button>
                                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">×</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
