'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Users, CheckSquare, BarChart2, LogOut } from 'lucide-react';

export default function AdminSidebar() {
    const currentPath = usePathname();

    const navLinks = [
        { name: "User Management", href: "/admin/users", icon: Users },
        { name: "Moderation", href: "/admin/moderation", icon: CheckSquare },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
    ];

    const activeClass = "flex flex-row items-center p-2 lg:p-3 rounded-lg bg-pink-600 text-white font-semibold text-base whitespace-nowSrap";
    const inactiveClass = "flex flex-row items-center p-2 lg:p-3 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-white text-base whitespace-nowrap";

    return (
        <aside className="w-full h-full bg-gray-900 text-white flex flex-row lg:flex-col p-2 lg:p-4 shadow-2xl z-20 items-center lg:items-stretch">

            {/* --- THIS IS THE FIX (BRANDING) --- */}
            {/* Admin Branding: Replaced Shield with V logo and new text */}
            <div className="hidden lg:flex text-2xl font-bold text-pink-500 mb-8 border-b border-gray-700 pb-4 items-center flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-pink-600 flex items-center justify-center mr-2 flex-shrink-0">
                    <span className="text-xl font-bold text-white">V</span>
                </div>
                Valise Admin
            </div>

            {/* Mobile-only Logo: Replaced Shield with V logo */}
            <div className="lg:hidden text-pink-500 p-2 flex-shrink-0">
                <div className="w-7 h-7 rounded-lg bg-pink-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">V</span>
                </div>
            </div>
            {/* --- END OF FIX --- */}

            <nav className="flex flex-row justify-around flex-grow w-full lg:flex-col lg:space-y-2 lg:justify-start">
                {navLinks.map((link) => {
                    const isActive = currentPath.startsWith(link.href);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={isActive ? activeClass : inactiveClass}
                        >
                            <link.icon className="w-5 h-5 mr-0 lg:mr-3" />
                            <span className="hidden lg:inline">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t border-gray-700 lg:mt-auto flex-shrink-0">
                <div className="hidden lg:flex items-center space-x-2 mb-2">
                    <span className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center text-sm font-bold">AD</span>
                    <p className="text-sm text-gray-300">Administrator</p>
                </div>

                <button onClick={() => { localStorage.removeItem('admin_token'); window.location.href = '/admin/login'; }} className="w-auto lg:w-full p-2 lg:p-3 rounded-lg text-sm bg-red-600 hover:bg-red-700 transition flex items-center justify-center lg:space-x-2">
                    <LogOut className="w-5 h-5 lg:w-4 lg:h-4" />
                    <span className="hidden lg:inline">Logout</span>
                </button>
            </div>
        </aside>
    );
}