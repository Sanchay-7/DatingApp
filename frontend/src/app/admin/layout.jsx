// src/app/dashboard/admin/layout.jsx
'use client';

import React from 'react';
// Import the component you just created and saved
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({ children }) {
    return (
        // This establishes the two-column layout (Sidebar fixed, content scrolls)
        <div className="flex h-screen bg-gray-100 dark:bg-gray-800">

            {/* Column 1: The Admin Sidebar */}
            <AdminSidebar />

            {/* Column 2: The Main Content Area */}
            {/* flex-1 makes it take up the rest of the space; overflow-y-auto enables scrolling */}
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>

        </div>
    );
}