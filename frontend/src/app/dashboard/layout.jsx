// DatingApp/frontend/src/app/dashboard/layout.jsx

"use client"; // Add this directive for client-side components

// Make sure React is imported if needed, though Next.js 13+ handles it often.
import React from 'react';

// Use the correct '@' alias to import your Sidebar
import Sidebar from '@/components/Sidebar';

export default function DashboardLayout({ children }) {
    return (
        // This div creates the main two-column layout: Sidebar + Main Content
        <div className="flex h-screen overflow-hidden">

            {/* COLUMN 1: SIDEBAR */}
            <Sidebar />

            {/* COLUMN 2: MAIN CONTENT (Pages like Discover, Messages, etc.) */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
            </main>

        </div>
    );
}