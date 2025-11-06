'use client';

import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
    return (
        // --- THIS IS THE FIX ---
        // 1. Changed to `flex-col` (mobile default)
        // 2. Added `lg:flex-row` (desktop)
        <div className="flex flex-col lg:flex-row h-screen bg-gray-100 dark:bg-gray-800">

            {/* Column 1: The Admin Sidebar Container */}
            {/* 1. Added `w-full` (mobile default) */}
            {/* 2. Added `lg:w-64` (desktop width) */}
            {/* 3. Added `flex-shrink-0` to prevent shrinking */}
            <div className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </div>

            {/* Column 2: The Main Content Area (This was already fine) */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>

        </div>
    );
}