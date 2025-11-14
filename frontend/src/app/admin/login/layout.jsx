'use client';

import React from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { usePathname } from 'next/navigation'; // Import the usePathname hook

export default function AdminLayout({ children }) {
    const pathname = usePathname(); // Get the current URL path

    // If we are on the login page, render *only* the children (the login form)
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    // Otherwise, render the full admin dashboard layout
    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-100 dark:bg-gray-800">
            <div className="w-full lg:w-64 flex-shrink-0">
                <AdminSidebar />
            </div>
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}