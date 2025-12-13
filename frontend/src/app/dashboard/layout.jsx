"use client";

import React, { useEffect } from 'react';
import Image from 'next/image';
import Sidebar from '@/components/Sidebar';
import { requestNotificationPermission } from '@/lib/notifications';

export default function DashboardLayout({ children }) {
    useEffect(() => {
        // Request notification permission on dashboard load
        requestNotificationPermission();
    }, []);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {/* Top Header - Mobile only */}
            <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Image 
                        src="/logo.jpg" 
                        alt="LuveKg" 
                        width={36} 
                        height={36}
                        className="w-9 h-9 rounded-md object-cover"
                    />
                    <span className="font-bold text-lg">LuveKg</span>
                </div>
            </header>

            {/* Main layout container */}
            <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                {/* Sidebar container: full width on mobile, 256px (w-64) on desktop */}
                <div className="w-full lg:w-64 shrink-0">
                    <Sidebar />
                </div>

                {/* Main content area */}
                <main className="flex-1 overflow-y-auto bg-gray-50 pb-20 lg:pb-0">
                    {children}
                </main>
            </div>
        </div>
    );
}