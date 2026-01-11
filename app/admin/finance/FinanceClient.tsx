'use client';

import { useState, useEffect } from 'react';
import { getRevenueData, getCategoryPerformance, getTopSellers, exportFinancialData } from '@/app/actions/admin-finance';

export default function FinanceClient({ totalRevenue, totalFees, transactionCount, recentTransactions }: any) {
    const [timeRange, setTimeRange] = useState('30');
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);
    const [topSellers, setTopSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [timeRange]);

    const loadData = async () => {
        setLoading(true);
        try {
            const endDate = new Date().toISOString();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(timeRange));

            const [revenue, categories, sellers] = await Promise.all([
                getRevenueData(startDate.toISOString(), endDate, 'daily'),
                getCategoryPerformance(),
                getTopSellers(5)
            ]);

            setRevenueData(revenue);
            setCategoryData(categories);
            setTopSellers(sellers);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            const { csv, filename } = await exportFinancialData();
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (e: any) {
            alert(e.message);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Financial Reports</h1>
                <button
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                    📊 Export to CSV
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p className="text-sm font-medium text-slate-500 mb-1">Total Revenue</p>
                    <h3 className="text-3xl font-bold text-slate-900">£{totalRevenue.toFixed(2)}</h3>
                    <p className="text-xs text-slate-500 mt-1">{transactionCount} transactions</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p className="text-sm font-medium text-slate-500 mb-1">Platform Fees</p>
                    <h3 className="text-3xl font-bold text-green-600">£{totalFees.toFixed(2)}</h3>
                    <p className="text-xs text-slate-500 mt-1">{((totalFees / totalRevenue) * 100).toFixed(1)}% of revenue</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <p className="text-sm font-medium text-slate-500 mb-1">Avg Transaction</p>
                    <h3 className="text-3xl font-bold text-blue-600">£{(totalRevenue / transactionCount).toFixed(2)}</h3>
                    <p className="text-xs text-slate-500 mt-1">Per completed sale</p>
                </div>
            </div>

            {/* Time Range Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-800">Revenue Trends</h2>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading data...</div>
                ) : (
                    <div className="space-y-2">
                        {revenueData.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-600 w-32">{new Date(item.date).toLocaleDateString()}</span>
                                <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                                    <div
                                        className="bg-green-500 h-full rounded-full"
                                        style={{ width: `${Math.min((item.platformFees / Math.max(...revenueData.map(d => d.platformFees))) * 100, 100)}%` }}
                                    />
                                </div>
                                <span className="text-sm font-semibold text-slate-900 w-24 text-right">£{item.platformFees.toFixed(2)}</span>
                                <span className="text-xs text-slate-500 w-16 text-right">{item.transactionCount} txns</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Category Performance */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Category Performance</h2>
                    <div className="space-y-3">
                        {categoryData.slice(0, 5).map((cat, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-900">{cat.category}</p>
                                    <p className="text-xs text-slate-500">{cat.itemsSold} items sold</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-600">£{cat.totalSales.toFixed(2)}</p>
                                    <p className="text-xs text-slate-500">Avg: £{cat.avgPrice.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Sellers */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Sellers</h2>
                    <div className="space-y-3">
                        {topSellers.map((seller, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-slate-400">#{idx + 1}</span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{seller.username}</p>
                                        <p className="text-xs text-slate-500">{seller.sales} sales</p>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-green-600">£{seller.revenue.toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Transactions</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-slate-900">Date</th>
                                <th className="px-4 py-3 font-semibold text-slate-900">Buyer</th>
                                <th className="px-4 py-3 font-semibold text-slate-900">Seller</th>
                                <th className="px-4 py-3 font-semibold text-slate-900">Listing</th>
                                <th className="px-4 py-3 font-semibold text-slate-900 text-right">Amount</th>
                                <th className="px-4 py-3 font-semibold text-slate-900 text-right">Fee</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentTransactions.map((tx: any) => (
                                <tr key={tx.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 text-xs text-slate-600">
                                        {new Date(tx.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-slate-900">{tx.buyer?.username || 'Unknown'}</td>
                                    <td className="px-4 py-3 text-slate-900">{tx.seller?.username || 'Unknown'}</td>
                                    <td className="px-4 py-3 text-slate-700">{tx.listing?.title || 'N/A'}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                        £{tx.total_amount_gbp?.toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-semibold text-green-600">
                                        £{tx.platform_fee_gbp?.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
