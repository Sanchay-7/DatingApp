"use client";

import React, { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { requestNotificationPermission } from '@/lib/notifications';

export default function DashboardLayout({ children }) {
    useEffect(() => {
        // Request notification permission on dashboard load
        requestNotificationPermission();
    }, []);

    return (
        // This is the responsive layout container
        // It's a COLUMN on mobile, and a ROW on large screens
        <div className="flex flex-col lg:flex-row h-screen overflow-hidden">

            {/* Sidebar container: full width on mobile, 256px (w-64) on desktop */}
            <div className="w-full lg:w-64 shrink-0">
                <Sidebar />
            </div>

            {/* Main content area */}
            <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 lg:pb-0">
                {children}
            </main>
        </div>
    );
}