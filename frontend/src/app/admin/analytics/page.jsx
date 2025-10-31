// src/app/admin/analytics/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
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

export default function AnalyticsPage() {
    // State to hold the analytics data
    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // --- API FETCH LOGIC (SAVED FOR LATER) ---
    /*
    // TODO: After this PR is merged, uncomment this block.
    
    useEffect(() => {
        const API_ENDPOINT = "http://localhost:5000/api/admin/analytics"; 
        
        async function fetchAnalytics() {
            setIsLoading(true); 
            try {
                const response = await fetch(API_ENDPOINT); 
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json(); 
                setAnalyticsData(data.analytics || DEFAULT_ANALYTICS); 
            } catch (error) {
                console.error("Failed to fetch analytics:", error);
                setAnalyticsData(DEFAULT_ANALYTICS); // Fallback to defaults on error
            } finally {
                setIsLoading(false);
            }
        }
        fetchAnalytics();
    }, []); // Empty array means "run once"
    */

    // --- TEMPORARY: Simulate loading default data (since fetch is commented) ---
    useEffect(() => {
        setAnalyticsData(DEFAULT_ANALYTICS);
        setIsLoading(false);
    }, []);
    // --- END TEMPORARY ---

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
                <AdminCard title="User Growth: Signups vs. Deletes (Last 30 Days)">
                    <div className="h-80 flex items-center justify-center text-gray-500 bg-gray-900 rounded-lg">
                        [ Placeholder for Line Chart Component (e.g., Recharts or Nivo) ]
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