// src/app/admin/analytics/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, UserPlus, Zap, BarChart, ShieldAlert } from 'lucide-react';
// IMPORT THE NEW COMPONENT
import AdminCard from '@/components/AdminCard';

// Reusable Metric Card Component (No changes here)
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

// This is the clean, default state for the analytics
const DEFAULT_ANALYTICS = {
    activeUsers: "0",
    activeUsersChange: "+0%",
    newSignups: "0",
    newSignupsChange: "+0%",
    totalSwipes: "0",
    totalSwipesChange: "+0%",
    pendingReports: "0",
    pendingReportsChange: "OK"
};
// Ensure default includes signupSeries so charts get a consistent shape
DEFAULT_ANALYTICS.signupSeries = [];

// Simple bar chart for signupSeries (no external deps)
const SignupSeriesBarChart = ({ series = [] }) => {
    if (!Array.isArray(series) || series.length === 0) {
        return (
            <div className="h-40 flex items-center justify-center text-gray-500">No data</div>
        );
    }

    const max = Math.max(...series.map((s) => s.count || 0), 1);

    return (
        <div className="w-full h-40 flex items-end gap-1">
            {series.map((s) => {
                const height = Math.round(((s.count || 0) / max) * 100);
                return (
                    <div key={s.date} className="flex-1 flex items-end">
                        <div
                            title={`${s.date}: ${s.count}`}
                            className="mx-0.5 w-full bg-green-500 hover:bg-green-400 transition-all rounded-t"
                            style={{ height: `${height}%` }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

export default function AnalyticsPage() {
    // State to hold the analytics data
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Fetch analytics from backend (protected route)
    useEffect(() => {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

        async function fetchAnalytics() {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('admin_token');
                if (!token) {
                    router.push('/admin/login');
                    return;
                }

                const res = await fetch(`${API_BASE}/api/v1/admin/analytics`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    if (res.status === 401 || res.status === 403) {
                        router.push('/admin/login');
                        return;
                    }
                    throw new Error(`HTTP ${res.status}`);
                }

                const body = await res.json();
                setAnalyticsData(body.analytics || { ...DEFAULT_ANALYTICS, signupSeries: [] });
            } catch (err) {
                console.error('Failed to load analytics', err);
                setAnalyticsData({ ...DEFAULT_ANALYTICS, signupSeries: [] });
            } finally {
                setIsLoading(false);
            }
        }

        fetchAnalytics();
    }, [router]);

    // Show loading spinner while analytics are fetched
    if (isLoading || !analyticsData) {
        return (
            <div className="p-8 h-full flex justify-center items-center">
                <p className="text-gray-400">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
                <BarChart className="w-7 h-7 mr-3 text-green-500" />
                Application Analytics Overview
            </h1>

            {/* Section 1: Key Metrics Cards (Now uses data from state) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <MetricCard
                    title="Active Users Today"
                    value={analyticsData.activeUsers}
                    change={analyticsData.activeUsersChange}
                    colorClass="border-green-500"
                    icon={TrendingUp}
                />
                <MetricCard
                    title="New Signups (24h)"
                    value={analyticsData.newSignups}
                    change={analyticsData.newSignupsChange}
                    colorClass="border-pink-500"
                    icon={UserPlus}
                />
                <MetricCard
                    title="Total Swipes Daily"
                    value={analyticsData.totalSwipes}
                    change={analyticsData.totalSwipesChange}
                    colorClass="border-indigo-500"
                    icon={Zap}
                />
                <MetricCard
                    title="Pending Reports"
                    value={analyticsData.pendingReports}
                    change={analyticsData.pendingReportsChange}
                    colorClass="border-red-500"
                    icon={ShieldAlert}
                />
            </div>

            {/* Section 2: User Growth Chart Placeholder */}
            <div className="mb-8">
                <AdminCard title="User Growth: Signups (Last 30 Days)">
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <div className="text-sm text-gray-300 mb-3">Signups per day (last 30 days)</div>
                        <SignupSeriesBarChart series={analyticsData.signupSeries || []} />
                    </div>
                </AdminCard>
            </div>

            {/* Section 3: Engagement Metrics Placeholder */}
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