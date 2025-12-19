import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend
} from 'recharts';

const StatsWidget = () => {
    const [stats, setStats] = useState({ total: 0, open: 0, closed: 0, recent: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/documents/stats');
                setStats(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch stats', err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const data = stats.breakdown ? [
        { name: 'Draft', value: stats.breakdown.Draft || 0, color: '#9CA3AF' },
        { name: 'Pending', value: stats.breakdown['Pending Approval'] || 0, color: '#F59E0B' },
        { name: 'Approved', value: stats.breakdown.Approved || 0, color: '#10B981' },
        { name: 'Rejected', value: stats.breakdown.Rejected || 0, color: '#EF4444' },
        { name: 'Open', value: stats.breakdown.Open || 0, color: '#3B82F6' },
        { name: 'Closed', value: stats.breakdown.Closed || 0, color: '#6B7280' }
    ] : [
        // Fallback for older backend
        { name: 'Open', value: stats.open, color: '#10B981' },
        { name: 'Closed', value: stats.closed, color: '#EF4444' },
    ];

    // Filter out zero values for cleaner chart
    const chartData = data.filter(d => d.value > 0);

    if (loading) return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* Total Documents */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Documents</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                </div>

                {/* Open/Active */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active / Open</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.open}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full text-green-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>

                {/* Closed/Archived */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Closed / Archived</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.closed}</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-full text-red-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>

                {/* Recent */}
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md">
                    <div>
                        <p className="text-sm font-medium text-gray-500">New (7 Days)</p>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{stats.recent}</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full text-purple-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                </div>
            </div>

            {/* Charts Area */}
            {stats.total > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Document Status Distribution</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatsWidget;
