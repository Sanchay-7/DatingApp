// src/app/admin/analytics/page.jsx
'use client';

import React from 'react';
import { TrendingUp, UserPlus, Zap, BarChart, ShieldAlert } from 'lucide-react';
// IMPORT THE NEW COMPONENT
import AdminCard from '@/components/AdminCard';

// Reusable Metric Card Component (No changes here, it still needs its styling)
const MetricCard = ({ title, value, change, colorClass, icon: Icon }) => (
    <div className={`bg-gray-800 p-6 rounded-xl shadow-lg border-t-4 ${colorClass}`}>
        <div className="flex items-center justify-between">
            <Icon className={`w-8 h-8 ${colorClass.replace('border-', 'text-')}`} />
            <span className={`text-sm font-semibold ${colorClass.replace('border-', 'text-')}`}>
                {change}
            </span>
        </div>
        <p className="text-3xl font-extrabold text-white mt-4">{value}</p>
        <p className="text-sm text-gray-400 mt-1">{title}</p>
    </div>
);

export default function AnalyticsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
                <BarChart className="w-7 h-7 mr-3 text-green-500" />
                Application Analytics Overview
            </h1>

            {/* Section 1: Key Metrics Cards (These still use the MetricCard styling) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard
                    title="Active Users Today"
                    value="5,042"
                    change="+5%"
                    colorClass="border-green-500"
                    icon={TrendingUp}
                />
                <MetricCard
                    title="New Signups (24h)"
                    value="320"
                    change="+15%"
                    colorClass="border-pink-500"
                    icon={UserPlus}
                />
                <MetricCard
                    title="Total Swipes Daily"
                    value="1.2M"
                    change="-2%"
                    colorClass="border-indigo-500"
                    icon={Zap}
                />
                <MetricCard
                    title="Pending Reports"
                    value="5"
                    change="URGENT"
                    colorClass="border-red-500"
                    icon={ShieldAlert}
                />
            </div>

            {/* Section 2: User Growth Chart Placeholder - NOW USING <AdminCard /> */}
            <div className="mb-8">
                <AdminCard title="User Growth: Signups vs. Deletes (Last 30 Days)">
                    <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-900 rounded-lg">
                        [ Placeholder for Line Chart Component (e.g., Recharts or Nivo) ]
                    </div>
                </AdminCard>
            </div>

            {/* Section 3: Engagement Metrics Placeholder - NOW USING <AdminCard /> */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AdminCard title="Engagement & Retention">
                        <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-900 rounded-lg">
                            [ Placeholder for Bar Chart: Messages Sent / Average Session Length ]
                        </div>
                    </AdminCard>
                </div>
                <div>
                    <AdminCard title="Gender Ratio">
                        <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-900 rounded-lg">
                            [ Placeholder for Pie Chart ]
                        </div>
                    </AdminCard>
                </div>
            </div>
        </div>
    );
}