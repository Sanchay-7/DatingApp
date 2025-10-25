// app/(dashboard)/layout.jsx (Layout with Sidebar)

import Sidebar from "@/components/Sidebar";
import React from 'react'; // Import React for the component

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