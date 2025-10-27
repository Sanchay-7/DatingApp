// src/components/AdminSidebar.jsx (UPDATED LINKS)
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, CheckSquare, BarChart2, LogOut } from 'lucide-react'; // Icons

export default function AdminSidebar() {
    const currentPath = usePathname();

    const navLinks = [
        // FIX: Hrefs are now correctly updated to start with /admin
        { name: "User Management", href: "/admin/users", icon: Users },
        { name: "Moderation", href: "/admin/moderation", icon: CheckSquare },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    ];

    // Tailwind classes for styling (using dark background)
    const activeClass = "flex items-center p-3 rounded-lg bg-pink-600 text-white font-semibold transition duration-150";
    const inactiveClass = "flex items-center p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white transition duration-150";

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col p-4 shadow-2xl z-20 h-screen">

            {/* Admin Branding */}
            <div className="text-2xl font-bold text-pink-500 mb-8 border-b border-gray-700 pb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-pink-500" />
                Admin Panel
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2 flex-grow">
                {navLinks.map((link) => {
                    // Check if the current URL starts with the link's href for active state
                    const isActive = currentPath.startsWith(link.href);

                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={isActive ? activeClass : inactiveClass}
                        >
                            <link.icon className="w-5 h-5 mr-3" />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Admin User Placeholder (e.g., Logout) */}
            <div className="pt-4 border-t border-gray-700 mt-auto">
                <div className="flex items-center space-x-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-sm font-bold">AD</span>
                    <p className="text-sm text-gray-300">Administrator</p>
                </div>
                <button className="w-full p-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 transition flex items-center justify-center space-x-2">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}